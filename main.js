import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// === 1. KHỞI TẠO HỆ THỐNG & GÓC NHÌN CHÉO TỪ TRÊN XUỐNG ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2563eb); // Màu nền xanh Blueprint

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 18, 15); // Đẩy camera lên cao và lùi lại để nhìn toàn cảnh

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Bóng đổ mềm mại
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableRotate = true; 
controls.maxPolarAngle = Math.PI / 2.2; // Giới hạn góc lật, không cho camera chui xuống dưới đất
controls.update();

// Thêm lưới Blueprint bên dưới sàn
const gridHelper = new THREE.GridHelper(40, 40, 0xffffff, 0xffffff);
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
gridHelper.position.y = -0.05; // Hạ thấp một chút để không xuyên qua sàn nhà
scene.add(gridHelper);

// === 2. XÂY DỰNG MẶT BẰNG & VÁCH NGĂN ===
const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });

// Tạo sàn nhà kích thước 
const floor = new THREE.Mesh(new THREE.BoxGeometry(15, 0.1, 12), floorMat);
floor.receiveShadow = true;
scene.add(floor);

// Hàm tiện ích: Tự động xây tường
function buildWall(widthX, heightY, depthZ, posX, posZ) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(widthX, heightY, depthZ), wallMat);
    wall.position.set(posX, heightY / 2, posZ); // Tự động đẩy tường đứng lên mặt sàn
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
}

// Xây 4 bức tường bao quanh (Outer Walls)
buildWall(15.2, 3, 0.2, 0, -6);    // Tường sau
buildWall(15.2, 3, 0.2, 0, 6);     // Tường trước
buildWall(0.2, 3, 12, -7.5, 0);      // Tường trái
buildWall(0.2, 3, 12, 7.5, 0);       // Tường phải

// Xây vách ngăn bên trong (Chia phòng)
// Bức vách này nằm ở tọa độ x = -2, tạo thành 2 không gian trái/phải
buildWall(2.2, 3, 0.2, 0.9, -5.4); 
buildWall(0.2, 3, 0.7, 1.9, -5.7);  
buildWall(0.2, 3, 0.7, -0.1, -5.7);  



/*
// === 3. HỆ THỐNG ĐÈN SA BÀN ===
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Đèn định hướng chiếu chéo từ trên xuống cho toàn bộ sa bàn
const mainLight = new THREE.DirectionalLight(0xfff1e0, 2.5);
mainLight.position.set(10, 15, 10);
mainLight.castShadow = true;
// Mở rộng vùng phủ bóng đổ để bao trọn sàn nhà 16x10
mainLight.shadow.camera.left = -10;
mainLight.shadow.camera.right = 10;
mainLight.shadow.camera.top = 10;
mainLight.shadow.camera.bottom = -10;
scene.add(mainLight);
*/


// ==========================================
// 3. HỆ THỐNG ĐÈN & ÁNH SÁNG NỀN
// ==========================================

// Chọn 1 trong các mã màu sau cho AmbientLight (Ánh sáng khi tắt đèn chính):
// 0x111122 : Xanh đen/Xanh đêm (Cảm giác tối muộn, dễ chịu) - Khuyên dùng!
// 0x222222 : Xám tối (Trung tính, tối vừa phải)
// 0x333333 : Xám sáng hơn (Dễ nhìn rõ đồ vật hơn một chút)
// 0x2a2520 : Vàng đất tối (Cảm giác ấm áp nhưng thiếu sáng)


const ambientLight = new THREE.AmbientLight(0x333333, 1.5); // Cường độ 1.5 để vừa đủ nhìn
scene.add(ambientLight);

const ceilingLight = new THREE.PointLight(0xffffff, 4, 0, 0);
ceilingLight.position.set(0, 8, 0);
ceilingLight.castShadow = false;
scene.add(ceilingLight);

// Lấy thẻ HTML của vòng tròn bóng đèn
const lightWidget = document.getElementById('light-widget');

// Khởi tạo trạng thái ban đầu (Giả sử lúc mới vào web là đèn đang BẬT)
let isLightOn = true;
// Bật giao diện sáng mặc định
if (lightWidget) lightWidget.classList.add('light-on');

// HÀM XỬ LÝ KHI NGƯỜI DÙNG CLICK VÀO NÚT
function toggleLight() {
    isLightOn = !isLightOn; // Đảo ngược trạng thái (Đang bật thành tắt, đang tắt thành bật)

    if (isLightOn) {
        // 1. Bật đèn trên sa bàn 3D
        ceilingLight.intensity = 4; 
        // 2. Đổi giao diện nút thành màu vàng sáng
        lightWidget.classList.add('light-on');
        
        console.log("Đã BẬT đèn");
        // GỢI Ý THÊM: Chỗ này sau này bạn bắn bản tin qua Socket xuống vi điều khiển để đóng Relay
        // ví dụ: socket.send(JSON.stringify({ command: "LIGHT_ON" }));
        
    } else {
        // 1. Tắt đèn trên sa bàn 3D (chỉ còn ánh sáng mờ ambientLight)
        ceilingLight.intensity = 0; 
        // 2. Đổi giao diện nút về màu xám tối
        lightWidget.classList.remove('light-on');
        
        console.log("Đã TẮT đèn");
        // Chỗ này bắn bản tin ngắt Relay:
        // ví dụ: socket.send(JSON.stringify({ command: "LIGHT_OFF" }));
    }
}

// Gắn bộ lắng nghe sự kiện Click chuột vào nút
if (lightWidget) {
    lightWidget.addEventListener('click', toggleLight);
}




// === 4. TẢI MÔ HÌNH 3D (TỰ ĐỘNG CHUẨN HÓA KÍCH THƯỚC) ===
const loader = new GLTFLoader();

function loadModel(path, position, targetHeight, rotationY = 0) {
    loader.load(
        path,
        (gltf) => {
            const model = gltf.scene;

            // 1. Tính toán kích thước thật và scale tự động
            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            box.getSize(size);
            const scaleFactor = targetHeight / size.y;
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // 2. Đặt vị trí và góc xoay
            model.position.set(position.x, position.y, position.z);
            model.rotation.y = rotationY;

            // 3. Tự động căn đáy chạm sàn
            const updatedBox = new THREE.Box3().setFromObject(model);
            const yOffset = position.y - updatedBox.min.y;
            model.position.y += yOffset;

            // 4. Bật đổ bóng
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(model);
        },
        undefined,
        (error) => console.error(`Lỗi khi tải mô hình ${path}:`, error)
    );
}

// ===5. QUẢN LÝ KHU VỰC VÀ VỊ TRÍ ĐẶT NGƯỜI (Cho phòng 15x12) ===

// Trục X: -7.5 đến 7.5 | Trục Z: -6.0 đến 6.0
const roomZones = {
    A: [ // Khu vực bên trái (Khu tủ/bàn sát tường trái)
        { x: -5.5, z: -4.0, ry: Math.PI / 2 },  // Vị trí 0
        { x: -5.5, z: -2.0, ry: Math.PI / 2 },  // Vị trí 1
        { x: -5.5, z: 0.0,  ry: Math.PI / 2 },  // Vị trí 2
        { x: -5.5, z: 2.0,  ry: Math.PI / 2 },  // Vị trí 3
        { x: -5.5, z: 4.0,  ry: Math.PI / 2 }   // Vị trí 4
    ],
    B: [ // Khu vực bàn họp ở giữa phòng (quanh tọa độ X=0)
        { x: -1.5, z: -3.0, ry: Math.PI / 2 },  // Vị trí 0 (Ghế trái trên)
        { x: -1.5, z: 0.0,  ry: Math.PI / 2 },  // Vị trí 1 (Ghế trái giữa)
        { x: -1.5, z: 3.0,  ry: Math.PI / 2 },  // Vị trí 2 (Ghế trái dưới)
        { x: 1.5,  z: -2.0, ry: -Math.PI / 2 }, // Vị trí 3 (Ghế phải trên)
        { x: 1.5,  z: 2.0,  ry: -Math.PI / 2 }  // Vị trí 4 (Ghế phải dưới)
    ],
    C: [ // Khu vực góc trên bên phải (X dương, Z âm)
        { x: 4.5, z: -4.5, ry: 0 },             // Vị trí 0
        { x: 6.0, z: -3.0, ry: Math.PI },       // Vị trí 1
        { x: 5.0, z: -1.5, ry: -Math.PI / 2 },  // Vị trí 2
        { x: 6.5, z: -1.0, ry: 0 }              // Vị trí 3
    ],
    D: [ // Khu vực góc dưới bên phải (X dương, Z dương)
        { x: 4.5, z: 1.5, ry: Math.PI },        // Vị trí 0
        { x: 6.0, z: 3.0, ry: 0 },              // Vị trí 1
        { x: 5.0, z: 4.5, ry: Math.PI / 2 },    // Vị trí 2
        { x: 6.5, z: 5.0, ry: Math.PI }         // Vị trí 3
    ]
};

// Bố trí đồ đạc vào phòng bên phải (x dương)
loadModel('/models/desk.glb', { x: -4.6, y: 0, z: -5.2 }, 0.8);
loadModel('/models/desk.glb', { x: 6.8, y: 0, z: 1 }, 0.8, Math.PI / -2);
loadModel('/models/desk.glb', { x: 6.3, y: 0, z: -3 }, 0.8, Math.PI / 1);

loadModel('/models/desk.glb', { x: 0.5, y: 0, z: -2.5 }, 0.8, Math.PI / 2);
loadModel('/models/desk.glb', { x: 0.5, y: 0, z: -1.3 }, 0.8, Math.PI / 2);
loadModel('/models/desk.glb', { x: 0.5, y: 0, z: -0.1 }, 0.8, Math.PI / 2);
loadModel('/models/desk.glb', { x: 0.5, y: 0, z: 1.1 }, 0.8, Math.PI / 2);
loadModel('/models/desk.glb', { x: 1.2, y: 0, z: -2.5 }, 0.8, Math.PI / 2);
loadModel('/models/desk.glb', { x: 1.2, y: 0, z: -1.3 }, 0.8, Math.PI / 2);
loadModel('/models/desk.glb', { x: 1.2, y: 0, z: -0.1 }, 0.8, Math.PI / 2);
loadModel('/models/desk.glb', { x: 1.2, y: 0, z: 1.1 }, 0.8, Math.PI / 2);

loadModel('/models/desk.glb', { x: -6.7, y: 0, z: -3.2 }, 0.8, Math.PI / 2);
loadModel('/models/desk.glb', { x: -6.7, y: 0, z: -1.8 }, 0.8, Math.PI / 2);
loadModel('/models/desk.glb', { x: -6.7, y: 0, z: -0.4 }, 0.8, Math.PI / 2);
loadModel('/models/desk.glb', { x: -6.7, y: 0, z: 1 }, 0.8, Math.PI / 2);
loadModel('/models/desk.glb', { x: -6.7, y: 0, z: 2.4 }, 0.8, Math.PI / 2);


loadModel('/models/chair.glb', { x: 0.5, y: 0, z: 1 }, 1.1, Math.PI / -2);
loadModel('/models/chair.glb', { x: 0.5, y: 0, z: -0.2 }, 1.1, Math.PI / -2);
loadModel('/models/chair.glb', { x: 0.5, y: 0, z: -1.4 }, 1.1, Math.PI / -2);
loadModel('/models/chair.glb', { x: 0.5, y: 0, z: -2.6 }, 1.1, Math.PI / -2);
loadModel('/models/chair.glb', { x: 1.2, y: 0, z: 1 }, 1.1, Math.PI / 2);
loadModel('/models/chair.glb', { x: 1.2, y: 0, z: -0.2 }, 1.1, Math.PI / 2);
loadModel('/models/chair.glb', { x: 1.2, y: 0, z: -1.4 }, 1.1, Math.PI / 2);
loadModel('/models/chair.glb', { x: 1.2, y: 0, z: -2.6 }, 1.1, Math.PI / 2);


loadModel('/models/cabinet.glb', { x: -4.5, y: 0, z: 5.5 }, 2);
loadModel('/models/cabinet.glb', { x: -3.5, y: 0, z: 5.5 }, 2);
loadModel('/models/cabinet.glb', { x: -2.5, y: 0, z: 5.5 }, 2);
loadModel('/models/cabinet.glb', { x: -1.5, y: 0, z: 5.5 }, 2);
loadModel('/models/cabinet.glb', { x: -0.5, y: 0, z: 5.5 }, 2);
loadModel('/models/cabinet.glb', { x: 0.5, y: 0, z: 5.5 }, 2);

// Đặt cửa ra vào và cửa sổ
loadModel('/models/door.glb', { x: 0.2, y: 0, z: 5.9 }, 2.2, Math.PI / 1); // Trên tường bên trái
loadModel('/models/window.glb', { x: 5, y: 1.0, z: -5.9 }, 1.2);         // Trên tường phía sau

// Mảng lưu trữ tất cả các object người đang có mặt trên sa bàn 3D
let activePeopleInRoom = [];
// Hàm đặt người vào một vị trí cố định trong khu vực
function spawnPersonAt(zoneName, slotIndex) {
    const zone = roomZones[zoneName];
    if (!zone || slotIndex < 0 || slotIndex >= zone.length) return;

    const slot = zone[slotIndex];

    loader.load('/models/person.glb', (gltf) => {
        const model = gltf.scene;
        
        // ========================================================
        // 1. TỰ ĐỘNG SCALE KÍCH THƯỚC NGƯỜI THEO TỶ LỆ PHÒNG (15x12)
        // ========================================================
        const targetHeight = 1.5; // Ép chiều cao mô hình người về đúng 1.6 mét trong không gian 3D
        
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        // Tính toán tỷ lệ co giãn dựa trên chiều cao thực tế của file .glb
        const scaleFactor = targetHeight / size.y;
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

         //2. Bật tính năng đổ bóng cho nhân vật nhìn cho thật
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
          }
        });

        // 3. Đặt tọa độ X, Z và Góc xoay (RY) theo điểm neo đã cấu hình
        model.position.x = slot.x;
        model.position.z = slot.z;
        model.rotation.y = slot.ry;

        // 4. TỰ ĐỘNG CĂN CHÂN CHẠM SÀN (Không để người bị lún hay lơ lửng)
        // Vì sàn dày 0.1 và đặt ở tâm (0,0,0) nên mặt sàn trên cùng ở tọa độ Y = 0.05
        const updatedBox = new THREE.Box3().setFromObject(model);
        const floorTopY = 0.05; 
        model.position.y = floorTopY - updatedBox.min.y;

        // 5. Đưa vào không gian và lưu vết để quản lý
        scene.add(model);
        activePeopleInRoom.push(model);
    });

}



// 6. Hàm xóa toàn bộ người ra khỏi phòng để chuẩn bị cập nhật số lượng mới
function clearAllPeople() {
    activePeopleInRoom.forEach(personModel => {
        scene.remove(personModel); // Xóa khỏi không gian 3D
        
        // Giải phóng bộ nhớ RAM/GPU (Best practice trong Three.js)
        personModel.traverse(node => {
            if (node.isMesh) {
                node.geometry.dispose();
                if (Array.isArray(node.material)) {
                    node.material.forEach(mat => mat.dispose());
                } else {
                    node.material.dispose();
                }
            }
        });
    });
    
    // Reset mảng về rỗng
    activePeopleInRoom = [];
}


function updateRoomByCameraCount(cameraData) {
    // 1. Xóa sạch người cũ trên sa bàn
    clearAllPeople();

    let totalPeople = 0;

    // 2. Duyệt qua dữ liệu và spawn người mới
    for (const zoneName in cameraData) {
        const count = cameraData[zoneName];
        totalPeople += count; // Cộng dồn tổng số người đang có mặt

        for (let i = 0; i < count; i++) {
            spawnPersonAt(zoneName, i);
        }
    }

    // 3. ĐIỀU KHIỂN NÚM TRÒN HÌNH NGƯỜI TỰ ĐỘNG
    const peopleWidget = document.getElementById('people-widget');
    if (peopleWidget) {
        if (totalPeople > 0) {
            peopleWidget.classList.add('people-active'); // Có người -> Sáng đèn xanh
        } else {
            peopleWidget.classList.remove('people-active'); // Phòng trống -> Tắt đèn
        }
    }
}



function start15SecondsGradualTest() {
    console.log("=== BẮT ĐẦU MÔ PHỎNG TIẾN TRÌNH THỜI GIAN THỰC (15 GIÂY) ===");

    let step = 0;
    const maxSteps = 5; // 5 lần quét * 3 giây = 15 giây

    
    // Định nghĩa sẵn kịch bản từng bước để mô phỏng sự thay đổi thực tế
    const timeline = [
        {   // Giây thứ 3: Phòng trống hoàn toàn (Kiểm tra xem núm người có TẮT không)
            camera: { A: 0, B: 0, C: 0, D: 0 },
            roomZones: 'A', //slot: 0 
        },
        {   // Giây thứ 6: Xuất hiện rải rác vài người (Núm người phải BẬT SÁNG XANH)
            camera: { A: 1, B: 0, C: 1, D: 0 },
            roomZones: 'B',//slot: 1
        },
        {   // Giây thứ 9: Người đổi vị trí và tăng số lượng lên đám đông
            camera: { A: 0, B: 2, C: 0, D: 1 },
            roomZones: 'C', //slot: 0
        },
        {   // Giây thứ 12: Đỉnh điểm phòng họp đông đúc, vị trí xáo trộn tiếp
            camera: { A: 2, B: 1, C: 1, D: 1 },
            roomZones: 'D', //slot: 2
        },
        {   // Giây thứ 15: Mọi người giải tán đi về hết (Núm người phải TỰ ĐỘNG TẮT)
            camera: { A: 0, B: 0, C: 0, D: 0 },
            roomZones: 'A', //slot: 1
        }
    ];    



    const testInterval = setInterval(() => {
        if (step >= maxSteps) {
            clearInterval(testInterval);
            console.log("=== KẾT THÚC MÔ PHỎNG 15 GIÂY ===");
            return;
        }

        const currentData = timeline[step];
        console.log(`\n[Lần quét thứ ${step + 1}] Giây thứ ${(step + 1) * 3}:`);
        console.log("- Dữ liệu người:", currentData.camera);
    
        updateRoomByCameraCount(currentData.camera);

        step++;
    }, 3000); // Kích hoạt sau mỗi 3000ms = 3 giây
}

// Kích hoạt bài test sau khi load trang 3 giây (để chờ model tải xong)
setTimeout(() => {
    start15SecondsGradualTest();
}, 3000);





/*
let currentStep = 0;

function runManualTest() {
    console.log("--- BẮT ĐẦU TEST HỆ THỐNG TRONG 10 GIÂY ---");

    const testInterval = setInterval(() => {
        if (currentStep >= testScenarios.length) {
            clearInterval(testInterval); // Dừng lại sau 10 giây (5 bước)
            console.log("--- KẾT THÚC TEST ---");
            // Tùy chọn: Xóa sạch người khi kết thúc test
            // clearAllPeople(); 
            return;
        }

        const currentData = testScenarios[currentStep];
        
        console.log(`Giây thứ ${(currentStep + 1) * 2}:`, currentData);
        
        // Gọi hàm cập nhật hiển thị 3D
        updateRoomByCameraCount(currentData);

        currentStep++;
    }, 4000); // 2000ms = 2 giây
}

// Kích hoạt test sau khi trang web tải xong 1 giây để đảm bảo mô hình đã sẵn sàng
setTimeout(runManualTest, 1000);
*/



// === 7. VÒNG LẶP RENDER MÀN HÌNH ===
function animate() {
    requestAnimationFrame(animate);
    
    // Đã xóa bỏ đoạn Math.sin() gây nhấp nháy
    // Bây giờ vòng lặp chỉ làm đúng 1 nhiệm vụ là vẽ lại 3D
    renderer.render(scene, camera);
}

// Tự động điều chỉnh kích thước khi thu/phóng trình duyệt
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();









//                        ĐOẠN INDEX.HTML CŨ
/*
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Twin Classroom - Mock Simulation</title>
    <style>
        body { margin: 0; overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        * Bảng điều khiển hiển thị thông số cảm biến *
        #dashboard {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.85);
            color: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            pointer-events: none; * Giúp chuột có thể xuyên qua bảng để xoay phòng 3D *
            min-width: 200px;
        }
        h3 { margin: 0 0 10px 0; font-size: 16px; color: #38bdf8; letter-spacing: 0.5px; }
        hr { border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 15px; }
        .stat { margin-bottom: 10px; font-size: 14px; display: flex; justify-content: space-between; }
        .value { font-weight: bold; color: #4ade80; }
    </style>
</head>
<body>

    <div id="dashboard">
        <h3>🏫 DIGITAL TWIN PHÒNG HỌC</h3>
        <hr>
        <div class="stat">Nhiệt độ: <span id="temp-value" class="value">--°C</span></div>
        <div class="stat">Ánh sáng đèn: <span id="light-value" class="value">-- Lux</span></div>
    </div>
    <button id="toggle-light-btn" style="margin-top: 10px; padding: 8px 16px; cursor: pointer;">
    Bật / Tắt Đèn
    </button>   
    <script type="module" src="/main.js"></script>
</body>
</html>
*/
