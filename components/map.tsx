"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Sidebar from "@/components/sidebar";

interface MapMarker {
  locationName: string;
  lat: number;
  lng: number;
  address: string;
  accidents?: {
    today: number;
    overall: number;
  };
  violations?: {
    total: number;
    reported: number;
  };
  challans?: {
    total: number;
    collected_amount: number;
  };
}

interface MapOptions {
  mapId: string | undefined;
  center: google.maps.LatLngLiteral;
  zoom: number;
  disableDefaultUI: boolean;
}

const mapOptions: MapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAPID,
  center: { lat: 18.517436621033905, lng: 73.8560968090087 },
  zoom: 15,
  disableDefaultUI: true,
};

const Response = () => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const threeRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  useEffect(() => {
    const markers: MapMarker[] = [
      {
        locationName: "Traffic Center A",
        lat: 18.58676425801763,
        lng: 73.90690857301867,
        address: "Pune Region A",
        accidents: {
          today: 5,
          overall: 150
        },
        violations: {
          total: 45,
          reported: 38
        },
        challans: {
          total: 78,
          collected_amount: 15600
        }
      },
      {
        locationName: "Traffic Center B",
        lat: 18.601081948912995,
        lng: 73.81627137235225,
        address: "Pune Region B",
        accidents: {
          today: 3,
          overall: 120
        },
        violations: {
          total: 32,
          reported: 28
        },
        challans: {
          total: 65,
          collected_amount: 13000
        }
      },
    ];

    const handleMarkerClick = (value: MapMarker) => {
      setSelectedMarker(value);
      setIsSidebarOpen(true);
    };

    const initMap = (): void => {
      const mapElement = document.getElementById("google-map");
      if (!mapElement) return;

      const map = new google.maps.Map(mapElement, mapOptions);
      mapRef.current = map;

      const locationButton = document.createElement("button");
      Object.assign(locationButton.style, {
        color: "#32CD32",
        fontSize: "1rem",
        margin: "10px",
        padding: "10px",
        backgroundColor: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        position: "absolute",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
      });

      locationButton.textContent = "Pan to Current Location";
      locationButton.classList.add("custom-map-control-button");
      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(locationButton);

      const infoWindow = new google.maps.InfoWindow({
        minWidth: 200,
        maxWidth: 200,
      });

      locationButton.addEventListener("click", () => {
        handleGeolocation(map, infoWindow);
      });

      const bounds = new google.maps.LatLngBounds();

      markers.forEach((value) => {
        const marker = new google.maps.Marker({
          position: { lat: value.lat, lng: value.lng },
          map: map,
          draggable: false,
          animation: google.maps.Animation.DROP,
          icon: "/icon/work-location.png",
        });

        marker.addListener("click", () => {
          handleMarkerClick(value);

          infoWindow.setContent(`
            <div class='feh-content text-black'>
              <h3>${value.locationName}</h3>
              <p>${value.address}</p>
            </div>
          `);
          infoWindow.open(map, marker);

          map.moveCamera({
            center: { lat: value.lat, lng: value.lng },
            heading: 0,
            tilt: 45,
            zoom: 19.90,
          });

          let heading = 0;
          const rotate = () => {
            heading = (heading + 0.1) % 360;
            map.moveCamera({ heading });
            animationFrameRef.current = requestAnimationFrame(rotate);
          };

          rotate();

          map.addListener("mousedown", () => {
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
            }
          });
        });

        bounds.extend(new google.maps.LatLng(value.lat, value.lng));
      });

      map.fitBounds(bounds);
      initThreeJS(mapElement);
    };

    const handleGeolocation = (
      map: google.maps.Map,
      infoWindow: google.maps.InfoWindow
    ): void => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent(`
              <h1 class='text-black'>Location found.</h1>
            `);
            infoWindow.open(map);
            map.setCenter(pos);
          },
          () => {
            handleLocationError(true, infoWindow, map.getCenter() as google.maps.LatLng);
          }
        );
      } else {
        handleLocationError(false, infoWindow, map.getCenter() as google.maps.LatLng);
      }
    };

    const initThreeJS = (mapElement: HTMLElement): void => {
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      threeRendererRef.current = renderer;
      renderer.setSize(window.innerWidth, window.innerHeight);
      mapElement.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      };

      animate();
    };

    const handleLocationError = (
      browserHasGeolocation: boolean,
      infoWindow: google.maps.InfoWindow,
      pos: google.maps.LatLng | null
    ): void => {
      if (!pos || !mapRef.current) return;
      
      infoWindow.setPosition(pos);
      infoWindow.setContent(
        browserHasGeolocation
          ? "Error: The Geolocation service failed."
          : "Error: Your browser doesn't support geolocation."
      );
      infoWindow.open(mapRef.current);
    };

    const script = document.createElement("script");
    script.src = process.env.NEXT_PUBLIC_GOOGLEMAP_URI || "";
    script.defer = true;
    script.async = true;
    window.initMap = initMap;
    document.head.appendChild(script);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (threeRendererRef.current) {
        threeRendererRef.current.dispose();
      }
      if (mapRef.current) {
        // Clean up map instance if needed
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <div
        className="google-map flex border-2 border-black w-screen h-screen justify-center align-center"
        id="google-map"
      ></div>
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        markerData={selectedMarker}
      />
    </div>
  );
};

// Add global type declaration for initMap
declare global {
  interface Window {
    initMap: () => void;
  }
}

export default Response;