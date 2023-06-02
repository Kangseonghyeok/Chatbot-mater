/*
**********************************************************
지도 샘플 사이트
https://apis.map.kakao.com/web/sample/

*/

// 1.지도생성 & 확대 축소 컨트롤러
var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
	center: new kakao.maps.LatLng(37.561836, 126.964197), //지도의 중심좌표.
	level: 3 //지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

//2 더미데이터 준비하기
const dataSet = [
	{
		title: "미영이네식당",
		address: "제주특별자치도 서귀포시 대정읍 하모항구로 42",
		url : "https://youtu.be/xQglan31kAE",
		category: "음식점",
	},
];


//3.마커표시하기

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

//주소-좌표 변환 함수
function getCoordsByAddress(address){
	// 주소로 좌표를 검색합니다
  return new Promise((resolve, reject) => {
	geocoder.addressSearch(address, function(result, status) {
		// 정상적으로 검색이 완료됐으면 
		if (status === kakao.maps.services.Status.OK) {
		   var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
		   resolve(coords);
		   return;
	   }
	   reject(new Error("getCoordsByAddress Error :  not valid Address")); 
	 }
   );   
  })
}

setMap(dataSet);



//4.마커에 인포윈도우 붙이기

function getContent(data){
	let placeUrl = data.url;
    let finUrl = '';
    placeUrl = placeUrl.replace("https://youtu.be/", '');
    placeUrl = placeUrl.replace("https://www.youtube.com/embed/", '');
    placeUrl = placeUrl.replace("https://www.youtube.com/watch?v=", '');
    transUrl = placeUrl.split('&')[0];

	return `
	<div class="infowindow">
        <div class="infowindow-img-container">
            <img src="https://img.youtube.com/vi/${transUrl}/mqdefault.jpg" class= "infowindow-img">
        </div>
        <div class="infowindow-body">
            <h5 class="infowindow-title">${data.title}</h5>
            <p class = "infowindow-address">${data.address}</p>
            <a href = "${data.url}" class="infowindow_btn" target="_blank">영상이동</a> 
        </div>
    </div>
	`;
}

async function setMap(dataSet){
	for (var i = 0; i < dataSet.length; i ++) {
		let coords = await getCoordsByAddress(dataSet[i].address);
		var marker = new kakao.maps.Marker({
		  map: map,
		  position: coords 
		});
	
	markerArray.push(marker);

	var infowindow = new kakao.maps.InfoWindow({
		content: getContent(dataSet[i])
	});
	infowindowArray.push(infowindow);

	// 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
	// 이벤트 리스너로는 클로저를 만들어 등록합니다 
	// for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
	kakao.maps.event.addListener(
		marker, 
		'click', 
		makeOverListener(map, marker, infowindow, coords)
	);
	kakao.maps.event.addListener(
		map, 
		'click', 
		makeOutListener(infowindow)
		);
  }
}	

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
// 1. 클릭시 다른 인프윈도우 닫기
// 2. 클릭한 곳으로 지도 중심 옮기기


function makeOverListener(map, marker, infowindow, coords) {
	return function() {
		// 1. 클릭시 다른 인프윈도우 닫기
		closeInfoWindow();
		infowindow.open(map, marker);
		//2. 클릭한 곳으로 지도 중심 옮기기
		map.panTo(coords)
	};
}

let infowindowArray = [];
function closeInfoWindow(){
	for(let infowindow of infowindowArray){
		infowindow.close();
	}
}


// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
	return function() {
		infowindow.close();
	};
}

//5. 카테고리 분류

// 카테고리
const categoryMap = {
	restaurant: "음식점",
	cafe: "카페",
	olleh: "올레길",
	oreum: "오름",
	exhibition: "전시회",
	seaview: "바다/전망",
	giftshop: "기념품점",
	etc: "기타",
};

const categoryList = document.querySelector(".category-list");

categoryList.addEventListener("click", categoryHandler);

function categoryHandler(event){
	const categoryId = event.target.id;
	const category = categoryMap[categoryId];

	//데이터 분류
	let categoryzedDataSet = [];
	for(let data of dataSet){
		if(data.category == category){
			categoryzedDataSet.push(data);
		}
	}

	//기존 마커 삭제
	closeMarker();
	//기존 인포윈도우 닫기
	closeInfoWindow();
	setMap(categoryzedDataSet);
}

let markerArray = [];
function closeMarker(){
	for(marker of markerArray){
		marker.setMap(null);
	}
	
}

