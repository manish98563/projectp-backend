import requests
import sys
import json
import os
from datetime import datetime
from io import BytesIO

class ProjectPAPITester:
    def __init__(self, base_url="https://project-p-ai.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.results = []

    def log_result(self, name, success, response_data=None, error=None):
        """Log test result"""
        self.tests_run += 1
        result = {
            "test": name,
            "success": success,
            "response": response_data,
            "error": str(error) if error else None,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            self.failed_tests.append(name)
            print(f"❌ {name} - FAILED: {error}")
        
        return success

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.admin_token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                if files:
                    # For multipart/form-data, don't set Content-Type header
                    test_headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=test_headers, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            response_data = None
            
            try:
                if response.content:
                    response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            if success:
                self.log_result(name, True, response_data)
                return success, response_data
            else:
                error = f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}"
                self.log_result(name, False, response_data, error)
                return success, response_data

        except Exception as e:
            self.log_result(name, False, None, str(e))
            return False, None

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test("Health Check", "GET", "health", 200)
        if success and response:
            if response.get('status') == 'ok':
                return True
            else:
                self.log_result("Health Check Status", False, response, "Status is not 'ok'")
                return False
        return False

    def test_get_jobs(self):
        """Test getting all jobs"""
        success, response = self.run_test("Get All Jobs", "GET", "jobs", 200)
        if success and response:
            if isinstance(response, list) and len(response) >= 3:
                print(f"Found {len(response)} jobs (expected at least 3)")
                return True
            else:
                self.log_result("Jobs Count Check", False, response, f"Expected at least 3 jobs, got {len(response) if isinstance(response, list) else 'invalid response'}")
                return False
        return False

    def test_get_single_job(self):
        """Test getting a single job by ID"""
        # First get all jobs to get an ID
        try:
            response = requests.get(f"{self.base_url}/jobs", timeout=30)
            if response.status_code == 200:
                jobs = response.json()
                if jobs and len(jobs) > 0:
                    job_id = jobs[0]['id']
                    return self.run_test("Get Single Job", "GET", f"jobs/{job_id}", 200)
            
            return self.log_result("Get Single Job", False, None, "No jobs available to test single job endpoint")
        except Exception as e:
            return self.log_result("Get Single Job", False, None, str(e))

    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        success, response = self.run_test(
            "Admin Login Success",
            "POST",
            "admin/login",
            200,
            data={"email": "admin@projectpinnovations.com", "password": "ChangeMe123!"}
        )
        if success and response and 'token' in response:
            self.admin_token = response['token']
            print("Admin token obtained successfully")
            return True
        return False

    def test_admin_login_failure(self):
        """Test admin login with wrong credentials"""
        return self.run_test(
            "Admin Login Failure",
            "POST", 
            "admin/login",
            401,
            data={"email": "wrong@email.com", "password": "wrongpass"}
        )

    def test_create_job(self):
        """Test creating a new job (requires admin token)"""
        if not self.admin_token:
            return self.log_result("Create Job", False, None, "No admin token available")
        
        job_data = {
            "title": "Test Engineer Position",
            "location": "Remote",
            "seniority": "Senior", 
            "description": "This is a test job posting created by automated tests",
            "tags": ["Testing", "Automation", "Python"]
        }
        
        return self.run_test("Create Job", "POST", "admin/jobs", 201, data=job_data)

    def test_update_job(self):
        """Test updating a job (requires admin token)"""
        if not self.admin_token:
            return self.log_result("Update Job", False, None, "No admin token available")
        
        # First get all jobs to find one to update
        try:
            response = requests.get(f"{self.base_url}/jobs", timeout=30)
            if response.status_code == 200:
                jobs = response.json()
                if jobs and len(jobs) > 0:
                    job_id = jobs[0]['id']
                    update_data = {
                        "title": "Updated Test Job Title",
                        "description": "This job description was updated by automated tests"
                    }
                    return self.run_test("Update Job", "PUT", f"admin/jobs/{job_id}", 200, data=update_data)
            
            return self.log_result("Update Job", False, None, "No jobs available to test update endpoint")
        except Exception as e:
            return self.log_result("Update Job", False, None, str(e))

    def test_delete_job(self):
        """Test deleting a job (requires admin token)"""
        if not self.admin_token:
            return self.log_result("Delete Job", False, None, "No admin token available")
        
        # First create a job to delete
        job_data = {
            "title": "Job To Delete",
            "location": "Remote",
            "seniority": "Junior", 
            "description": "This job will be deleted by automated tests",
            "tags": ["Test"]
        }
        
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}', 'Content-Type': 'application/json'}
            response = requests.post(f"{self.base_url}/admin/jobs", json=job_data, headers=headers, timeout=30)
            if response.status_code == 201:
                created_job = response.json()
                job_id = created_job['id']
                return self.run_test("Delete Job", "DELETE", f"admin/jobs/{job_id}", 204)
            else:
                return self.log_result("Delete Job", False, None, f"Failed to create job for deletion test: {response.status_code}")
        except Exception as e:
            return self.log_result("Delete Job", False, None, str(e))

    def test_get_applications(self):
        """Test getting admin applications (should be empty initially)"""
        if not self.admin_token:
            return self.log_result("Get Applications", False, None, "No admin token available")
        
        success, response = self.run_test("Get Applications", "GET", "admin/applications", 200)
        if success and isinstance(response, list):
            print(f"Found {len(response)} applications")
            return True
        return False

    def test_apply_with_valid_file(self):
        """Test application submission with valid file"""
        # Create a mock PDF file
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000079 00000 n \n0000000173 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n301\n%%EOF"
        
        files = {
            'resume': ('test_resume.pdf', BytesIO(pdf_content), 'application/pdf')
        }
        
        form_data = {
            'name': 'Test Applicant',
            'email': 'test@example.com',
            'message': 'This is a test application submission'
        }
        
        return self.run_test("Apply with Valid File", "POST", "apply", 201, data=form_data, files=files)

    def test_apply_with_invalid_file(self):
        """Test application submission with invalid file type"""
        # Create a mock text file (invalid)
        files = {
            'resume': ('invalid.txt', BytesIO(b'This is not a valid resume file'), 'text/plain')
        }
        
        form_data = {
            'name': 'Test Applicant',
            'email': 'test@example.com',
            'message': 'This should fail due to invalid file type'
        }
        
        return self.run_test("Apply with Invalid File", "POST", "apply", 400, data=form_data, files=files)

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Project P Innovations API Tests\n")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Public endpoints
        self.test_health_check()
        self.test_get_jobs() 
        self.test_get_single_job()
        
        # Admin authentication tests
        self.test_admin_login_failure()  # Test failure first
        self.test_admin_login_success()   # Then success to get token
        
        # Admin-only endpoints (require token)
        self.test_get_applications()
        self.test_create_job()
        self.test_update_job() 
        self.test_delete_job()
        
        # Application submission tests
        self.test_apply_with_valid_file()
        self.test_apply_with_invalid_file()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print(f"❌ Failed tests: {', '.join(self.failed_tests)}")
            return 1
        else:
            print("✅ All tests passed!")
            return 0

def main():
    tester = ProjectPAPITester()
    exit_code = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_api_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed, 
                'failed_tests': len(tester.failed_tests),
                'success_rate': f"{(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "0%"
            },
            'failed_tests': tester.failed_tests,
            'detailed_results': tester.results
        }, indent=2)
    
    return exit_code

if __name__ == "__main__":
    sys.exit(main())