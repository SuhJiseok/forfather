document.getElementById('login-button').addEventListener('click', function() {
    // 로그인 검증 로직 (예를 들어, 아이디와 비밀번호가 admin/admin인지 확인)
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    if (username === 'admin' && password === 'admin') {
      // 로그인 성공 시
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'block';
  
      // 상품 리스트 로드 등 추가 작업
      loadProductList();
    } else {
      alert('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  });


let products = []; // 상품 리스트를 저장할 배열

// 상태별 상품 개수를 업데이트하는 함수
function updateStatusFilterCounts() {
  // 상태별 개수 계산
  const statusCounts = {
    '구매전': 0,
    '구매완료': 0,
    '배송완료': 0,
    '납품완료': 0,
    '사진촬영완료': 0,
    '': 0 // 전체보기
  };

  products.forEach(product => {
    statusCounts[product.status] = (statusCounts[product.status] || 0) + 1;
  });

  // 각 필터의 라벨 업데이트
  const statuses = ['구매전', '구매완료', '배송완료', '납품완료', '사진촬영완료', ''];
  statuses.forEach((status, index) => {
    const label = document.querySelector(`label[for="status-${index + 1}"]`);
    if (label) {
      const count = status === '' ? products.length : (statusCounts[status] || 0);
      const statusText = status === '' ? '전체보기' : status;
      label.innerHTML = `${statusText} (${count})`;
    }
  });
}




function loadProductList() {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      products = JSON.parse(savedProducts);
    }
  
    // 상태 필터를 '구매전'으로 설정
    document.querySelector(`input[name="status-filter"][value="구매전"]`).checked = true;

    // 상태별 필터 개수 업데이트
    updateStatusFilterCounts();  
  
    // '구매전' 상태로 필터 적용
    applyFilters('구매전', '');
  }

document.getElementById('upload-button').addEventListener('click', function() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
  
    if (!file) {
      alert('엑셀 파일을 선택해주세요.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function(event) {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
  
      // 컬럼 헤더가 없는 경우 header 옵션을 1로 설정
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // 첫 번째 행이 컬럼 헤더인 경우 처리
    let startIndex = 0;
    if (jsonData[0][0] === '상품명') {
      startIndex = 1; // 첫 번째 행 스킵
    }

    // 상품 리스트에 데이터 저장
    products = jsonData.slice(startIndex).map((row, index) => ({
      id: index + 1,
      name: row[0] || `상품 ${index + 1}`, // A열의 값을 사용
      status: '구매전',
      photo: null,
    }));

      // 로컬 스토리지에 저장
      localStorage.setItem('products', JSON.stringify(products));
    
      // 상태별 필터 개수 업데이트
      updateStatusFilterCounts();    

     // 상태 필터를 '구매전'으로 설정
    document.querySelector(`input[name="status-filter"][value="구매전"]`).checked = true;
  
        // '구매전' 상태로 필터 적용
        applyFilters('구매전', '');
    };
  
    reader.readAsArrayBuffer(file);
  });

// **2. 검색 입력 필드에 이벤트 리스너 추가**
document.getElementById('search-input').addEventListener('input', function() {
  const searchText = document.getElementById('search-input').value;
  const selectedStatus = document.querySelector('input[name="status-filter"]:checked').value;
  applyFilters(selectedStatus, searchText);
});



//상품 리스트 표시 함수
function displayProductList(productArray) {
    const productListDiv = document.getElementById('product-list');
    productListDiv.innerHTML = ''; // 기존 내용 삭제
  
    productArray.forEach((product) => {
      const productDiv = document.createElement('div');
      productDiv.className = 'product-item';
  
      let actionButtons = '';

      if (product.status === '구매전') {
        // 구매완료 버튼만 표시
        actionButtons += `<button class="complete-button" onclick="changeStatus(${product.id}, '구매완료')"><i class="fa-solid fa-check"></i> 구매완료</button>`;
      } else if (product.status === '구매완료') {
        // 구매완료취소 및 배송완료 버튼 표시
        actionButtons += `<button class="cancel-button" onclick="changeStatus(${product.id}, '구매전')"><i class="fa-solid fa-times"></i> 구매완료취소</button>`;
        actionButtons += `<button class="complete-button" onclick="changeStatus(${product.id}, '배송완료')"><i class="fa-solid fa-check"></i> 배송완료</button>`;
      } else if (product.status === '배송완료') {
        // 배송완료취소 및 납품완료 버튼 표시
        actionButtons += `<button class="cancel-button" onclick="changeStatus(${product.id}, '구매완료')"><i class="fa-solid fa-times"></i> 배송완료취소</button>`;
        actionButtons += `<button class="complete-button" onclick="changeStatus(${product.id}, '납품완료')"><i class="fa-solid fa-check"></i> 납품완료</button>`;
      } else if (product.status === '납품완료') {
        // 납품완료취소 및 사진촬영완료 버튼 표시
        actionButtons += `<button class="cancel-button" onclick="changeStatus(${product.id}, '배송완료')"><i class="fa-solid fa-times"></i> 납품완료취소</button>`;
        actionButtons += `<button class="complete-button" onclick="changeStatus(${product.id}, '사진촬영완료')"><i class="fa-solid fa-check"></i> 사진촬영완료</button>`;
      } else if (product.status === '사진촬영완료') {
        // 사진촬영완료취소 버튼만 표시
        actionButtons += `<button class="cancel-button" onclick="changeStatus(${product.id}, '납품완료')"><i class="fa-solid fa-times"></i> 사진촬영완료취소</button>`;
        actionButtons += `<p>모든 과정 완료</p>`;
      }
    
      // 사진촬영 버튼은 '납품완료' 상태부터 표시
      if (product.status === '납품완료' || product.status === '사진촬영완료') {
        actionButtons += `<button onclick="takePhoto(${product.id})"><i class="fa-solid fa-camera"></i> 사진촬영</button>`;
      }
  
      // 상품 이미지 표시
      const photoHTML = product.photo
        ? `<img src="${product.photo}" alt="${product.name}" width="100" />`
        : '';
  
        productDiv.innerHTML = `
        <h3>${product.name}</h3>
        <p>상태: ${product.status}</p>
        <div class="action-buttons">
          ${actionButtons}
        </div>
        ${photoHTML}
      `;
  
      productListDiv.appendChild(productDiv);
    });
  }

  //상태변경함수 구현
function changeStatus(productId, newStatus) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    // 현재 상태에 따른 유효한 상태 변경인지 확인
    const validTransitions = {
      '구매전': ['구매완료'],
      '구매완료': ['구매전', '배송완료'],
      '배송완료': ['구매완료', '납품완료'],
      '납품완료': ['배송완료', '사진촬영완료'],
      '사진촬영완료': ['납품완료'],
    };

    if (validTransitions[product.status].includes(newStatus)) {
      product.status = newStatus;
      localStorage.setItem('products', JSON.stringify(products));

      // 상태별 필터 개수 업데이트
      updateStatusFilterCounts();      

      // 현재 필터와 검색어를 사용하여 리스트 갱신
      const selectedStatus = document.querySelector('input[name="status-filter"]:checked').value;
      const searchText = document.getElementById('search-input').value;
      applyFilters(selectedStatus, searchText);
    } else {
      alert('유효하지 않은 상태 변경입니다.');
    }
  }
}

function applyFilters(status, searchText) {
    let filteredProducts = products;
  
    if (status) {
      filteredProducts = filteredProducts.filter((product) => product.status === status);
    }
  
    if (searchText) {
      filteredProducts = filteredProducts.filter((product) =>
        product.name.includes(searchText)
      );
    }
  
    displayProductList(filteredProducts);
  }


// 상태 필터 라디오 버튼 변경 시 이벤트 리스너
document.getElementById('status-filter-form').addEventListener('change', function() {
    const selectedStatus = document.querySelector('input[name="status-filter"]:checked').value;
    applyFilters(selectedStatus, document.getElementById('search-input').value);
  });
  
  // // 검색 버튼 클릭 시 이벤트 리스너
  // document.getElementById('search-button').addEventListener('click', function() {
  //   const searchText = document.getElementById('search-input').value;
  //   const selectedStatus = document.querySelector('input[name="status-filter"]:checked').value;
  //   applyFilters(selectedStatus, searchText);
  // });


  //사진촬영
  function takePhoto(productId) {
    // 파일 입력 요소 생성
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*;capture=camera'; // 카메라 호출을 위한 설정
    fileInput.style.display = 'none';
  
   // 파일 선택 시 이벤트 처리
  fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const image = new Image();
        image.onload = function () {
          // 캔버스 생성
          const canvas = document.createElement('canvas');
          const maxWidth = 800; // 원하는 최대 가로 크기
          const maxHeight = 800; // 원하는 최대 세로 크기
          let width = image.width;
          let height = image.height;

          // 비율 유지하며 리사이즈
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, width, height);

          // 압축하여 이미지 데이터 얻기 (품질 0.7)
          const imageData = canvas.toDataURL('image/jpeg', 0.7);

          // 상품에 사진 저장 및 상태 변경
          const product = products.find((p) => p.id === productId);
          if (product) {
            product.photo = imageData;
            product.status = '사진촬영완료';
            localStorage.setItem('products', JSON.stringify(products));

            // 상태별 필터 개수 업데이트
            updateStatusFilterCounts();
            
            // 화면 갱신
            const selectedStatus = document.querySelector('input[name="status-filter"]:checked').value;
            const searchText = document.getElementById('search-input').value;
            applyFilters(selectedStatus, searchText);
          }
        };
        image.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  
    // 파일 입력 요소 클릭하여 카메라 또는 갤러리 호출
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }

  // //검색기능
  // document.getElementById('search-button').addEventListener('click', function() {
  //   const searchText = document.getElementById('search-input').value;
  //   const filteredProducts = products.filter((product) =>
  //     product.name.includes(searchText)
  //   );
  //   displayProductList(filteredProducts);
  // });

  // //필터기능 함수
  // function filterByStatus(status) {
  //   let filteredProducts;
  //   if (status) {
  //     filteredProducts = products.filter((product) => product.status === status);
  //   } else {
  //     filteredProducts = products;
  //   }
  //   displayProductList(filteredProducts);
  // }



  //데이터 추출기능함수
  document.getElementById('export-button').addEventListener('click', function() {
    // 사진촬영완료된 상품만 추출
    const completedProducts = products.filter(
      (product) => product.status === '사진촬영완료'
    );
  
    if (completedProducts.length === 0) {
      alert('사진촬영이 완료된 상품이 없습니다.');
      return;
    }
  
    // 엑셀 데이터 생성
    const worksheetData = completedProducts.map((product) => ({
      상품명: product.name,
      사진: product.photo,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  
    // 엑셀 파일 생성
    const workbookOut = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    // 파일 다운로드
    const blob = new Blob([workbookOut], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products.xlsx';
    link.click();
  });


  // 앱 로드 시 실행
loadProductList();