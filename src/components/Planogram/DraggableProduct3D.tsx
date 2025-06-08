import React, { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { GizmoHelper, GizmoViewport, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Product, PlacedProduct } from '../../types';

interface DraggableProduct3DProps {
  product: Product;
  placedProduct: PlacedProduct;
  shelfId: string;
  onPositionUpdate: (position: THREE.Vector3) => void;
  onDragEnd: () => void;
}

const DraggableProduct3D: React.FC<DraggableProduct3DProps> = ({
  product,
  placedProduct,
  onPositionUpdate,
  onDragEnd
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(() => new THREE.Vector3(
    placedProduct.positionX,
    product.height / 2,
    placedProduct.positionY
  ));

  // Calculate dimensions
  const width = product.width * (placedProduct.facings || 1);
  const height = product.height;
  const depth = product.depth;

  // Handle drag movement
  useEffect(() => {
    if (meshRef.current) {
      const handleDrag = () => {
        if (meshRef.current) {
          const newPosition = meshRef.current.position.clone();
          // Constrain movement
          newPosition.x = Math.max(-50, Math.min(50, newPosition.x));
          newPosition.y = position.y; // Keep Y position fixed
          newPosition.z = Math.max(-25, Math.min(25, newPosition.z));
          
          setPosition(newPosition);
          onPositionUpdate(newPosition);
        }
      };

      const handleDragEnd = () => {
        setIsDragging(false);
        onDragEnd();
      };

      meshRef.current.addEventListener('pointerdown', () => setIsDragging(true));
      meshRef.current.addEventListener('pointermove', handleDrag);
      meshRef.current.addEventListener('pointerup', handleDragEnd);
      meshRef.current.addEventListener('pointerleave', handleDragEnd);

      return () => {
        if (meshRef.current) {
          meshRef.current.removeEventListener('pointerdown', () => setIsDragging(true));
          meshRef.current.removeEventListener('pointermove', handleDrag);
          meshRef.current.removeEventListener('pointerup', handleDragEnd);
          meshRef.current.removeEventListener('pointerleave', handleDragEnd);
        }
      };
    }
  }, [onPositionUpdate, onDragEnd, position.y]);

  // Update text orientation to face camera
  useFrame(() => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  // Handle hover effects
  const [hovered, setHovered] = useState(false);
  
  useEffect(() => {
    if (meshRef.current) {
      document.body.style.cursor = hovered ? 'grab' : 'auto';
      if (isDragging) {
        document.body.style.cursor = 'grabbing';
      }
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, isDragging]);

  return (
    <>
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="black" />
      </GizmoHelper>
      
      <group position={position}>
        {/* Product Mesh */}
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color={hovered ? '#e5e7eb' : '#ffffff'}
            roughness={0.4}
            metalness={0.1}
          >
            {product.imageUrl && (
              <texture
                attach="map"
                url={product.imageUrl}
                wrapS={THREE.RepeatWrapping}
                wrapT={THREE.RepeatWrapping}
                repeat={new THREE.Vector2(placedProduct.facings || 1, 1)}
              />
            )}
          </meshStandardMaterial>
        </mesh>

        {/* Product Label using @react-three/drei Text component */}
        <group ref={textRef} position={[0, height + 0.5, 0]}>
          <Text
            color="#ffffff"
            fontSize={0.5}
            anchorX="center"
            anchorY="middle"
          >
            {product.name}
          </Text>
        </group>

        {/* Highlight when dragging */}
        {isDragging && (
          <mesh position={[0, -height/2 - 0.01, 0]}>
            <planeGeometry args={[width + 0.2, depth + 0.2]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
          </mesh>
        )}
      </group>
    </>
  );
};

export default DraggableProduct3D;