const locationMap = document.getElementById("location-map");

let map; //카카오지도
let userLatitude;
let userLongitude;
let isMapDrawn = false; //bool
let courseData = [];
// 마커를 그리는 함수
let markers = [];
let clickCourse = 0; // 0 내자신으로, 나머진 id

const panTo = (latitude, longitude) => {
  const moveLatLon = new kakao.maps.LatLng(latitude, longitude);
  map.panTo(moveLatLon);
};

const clickCourseList = (e, courseNo) => {
  if (clickCourse !== courseNo) {
    const courseWrap = document.querySelectorAll(".course");
    for (let i = 0; i < courseWrap.length; i++) {
      courseWrap[i].classList.remove("on");
    }
    // 클릭한 애 색칠
    e.currentTarget.classList.add("on");
    // 더해야함

    let courseLatitude;
    let course_longitude;

    if (courseNo === 0) {
      courseLatitude = userLatitude;
      course_longitude = userLongitude;
    } else {
      const matchCourse = courseData.find((c) => c.course_no === courseNo);
      courseLatitude = matchCourse.course_latitude;
      course_longitude = matchCourse.course_longitude;
    }
    panTo(courseLatitude, course_longitude);
    clickCourse = courseNo;
  }
};

const addMarker = (position) => {
  let marker = new kakao.maps.Marker({
    position: position,
  });
  marker.setMap(map);
  markers.push(marker);
};
// 마커를 지우는 함수
const delMarker = () => {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
};

const addCourseMarker = (course) => {
  let markerImageUrl = "/file/map_not_done.png";
  let markerImageSize = new kakao.maps.Size(24, 35);
  const kakaoMarkerImage = new kakao.maps.MarkerImage(
    markerImageUrl,
    markerImageSize
  );
  const latlng = new kakao.maps.LatLng(
    course.course_latitude,
    course.course_longitude
  );

  new kakao.maps.Marker({
    map: map,
    position: latlng,
    title: course.course_name,
    image: kakaoMarkerImage,
  });
  // 1. 방문했으면 a 이미지
  // 2. 방문 안했으면 b 이미지
};

const setCourseMarker = () => {
  for (let i = 0; i < courseData.length; i++) {
    addCourseMarker(courseData[i]);
  }
};

const drawMap = (latitude, Longitude) => {
  //
  const option = {
    center: new kakao.maps.LatLng(latitude, Longitude),
    level: 3,
  };
  map = new kakao.maps.Map(locationMap, option);
  map.setZoomable(false); //마우스 휠로 확대되는 거 막아줌
};

const configLocation = () => {
  if (navigator.geolocation) {
    // web api
    navigator.geolocation.watchPosition((pos) => {
      console.log(pos);
      userLatitude = pos.coords.latitude;
      userLongitude = pos.coords.longitude;
      //   다른 위치에 있어도
      console.log(userLatitude);
      console.log(userLongitude);

      if (!isMapDrawn) {
        // 지도 그리기
        drawMap(userLatitude, userLongitude);
        // 마커그리기
        // 변수값 변경
        setCourseMarker();
        isMapDrawn = true;
      }
      addMarker(new kakao.maps.LatLng(userLatitude, userLongitude));
      if (clickCourse === 0) {
        panTo(userLatitude, userLongitude);
      }
    });
  }
};

const makeCourseNaviHTML = (data) => {
  const courseWrap = document.getElementById("courseWrap");
  let html = "";
  for (let i = 0; i < data.length; i++) {
    html += `<li class="course" onclick="clickCourseList(event, ${data[i].course_no})">`;
    html += `<p>${data[i].course_name}</p>`;
    html += `</li>`;
  }
  html += `<li id = "myPosition" class="course on"  onclick="clickCourseList(event, 0)"> 나의위치</li>`;

  courseWrap.innerHTML = html;
};

// 코스데이터를 불러오는 fetch 함수 async - await
const getCourseList = async () => {
  const response = await fetch("/api/course");
  const result = await response.json();
  const data = result.data;
  courseData = data;
  console.log(response);

  console.log(data);
  makeCourseNaviHTML(data);
  configLocation();
};
getCourseList();
