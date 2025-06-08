import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, ContactShadows } from '@react-three/drei';
import { usePlanogram } from '../../context/PlanogramContext';
import { Product, PlacedProduct } from '../../types';
import * as THREE from 'three';

interface ProductMeshProps {
  product: Product;
  placedProduct: PlacedProduct;
  position: [number, number, number];
}

const ProductMesh: React.FC<ProductMeshProps> = React.memo(({ product, placedProduct, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Group>(null);

  const width = product.width;
  const height = product.height;
  const depth = product.depth;
  const facings = placedProduct.facings || 1;
  const totalWidth = width * facings;

  useFrame(({ camera }) => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={position}>
      {/* Product Box */}
      <mesh 
        ref={meshRef} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[totalWidth, height, depth]} />
        <meshPhysicalMaterial 
          color="#8c8c8c"
          roughness={0.4}
          metalness={0.6}
          clearcoat={0.5}
          clearcoatRoughness={0.3}
        />
      </mesh>
      
      {/* Product Label */}
      <group 
        ref={textRef}
        position={[0, height + 1, 0]}
      >
        <Text
          fontSize={2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          {product.name}
        </Text>
      </group>
    </group>
  );
});

interface ShelfMeshProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
}

const ShelfMesh: React.FC<ShelfMeshProps> = React.memo(({ width, height, depth, position }) => {
  return (
    <group position={position}>
      {/* Base */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[width, 0.5, depth]} />
        <meshPhysicalMaterial 
          color="#2f3542"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, height/2, -depth/2]} receiveShadow>
        <boxGeometry args={[width, height, 0.5]} />
        <meshPhysicalMaterial 
          color="#1f2937"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-width/2, height/2, 0]} receiveShadow>
        <boxGeometry args={[0.5, height, depth]} />
        <meshPhysicalMaterial 
          color="#1f2937"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[width/2, height/2, 0]} receiveShadow>
        <boxGeometry args={[0.5, height, depth]} />
        <meshPhysicalMaterial 
          color="#1f2937"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Grid */}
      <gridHelper 
        args={[width, 20, '#666666', '#444444']}
        position={[0, 0.26, 0]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
});

const Scene: React.FC<{ 
  shelf: { width: number; height: number; depth: number; products: PlacedProduct[] };
  products: Array<{ product: Product; placedProduct: PlacedProduct; position: [number, number, number] }>;
}> = React.memo(({ shelf, products }) => {
  const controlsRef = useRef(null);
  
  // Calculate optimal camera position based on shelf dimensions
  const maxDimension = Math.max(shelf.width, shelf.depth, shelf.height);
  const aspectRatio = window.innerWidth / window.innerHeight;
  
  const fov = 45;
  const halfFov = fov * 0.5;
  const halfFovRad = THREE.MathUtils.degToRad(halfFov);
  const targetHeight = maxDimension * 1.2;
  const cameraDistance = targetHeight / Math.tan(halfFovRad);

  const adjustedDistance = aspectRatio < 1 
    ? cameraDistance * (1 / aspectRatio) 
    : cameraDistance;

  const cameraPosition = [
    adjustedDistance * 0.8,
    adjustedDistance * 0.6,
    adjustedDistance * 0.8
  ] as [number, number, number];

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={cameraPosition}
        fov={fov}
        near={0.1}
        far={adjustedDistance * 4}
      />
      
      <OrbitControls 
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={maxDimension}
        maxDistance={adjustedDistance * 2}
        maxPolarAngle={Math.PI / 2}
        target={[0, shelf.height / 2, 0]}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      >
        <orthographicCamera 
          attach="shadow-camera" 
          args={[-maxDimension, maxDimension, maxDimension, -maxDimension]} 
        />
      </directionalLight>
      <pointLight position={[0, 50, 25]} intensity={0.5} />
      <pointLight position={[0, 50, -25]} intensity={0.3} />

      {/* Shadows */}
      <ContactShadows
        opacity={0.4}
        scale={maxDimension * 2}
        blur={2}
        far={10}
        resolution={512}
        color="#000000"
      />

      {/* Shelf */}
      <ShelfMesh
        width={shelf.width}
        height={shelf.height}
        depth={shelf.depth}
        position={[0, 0, 0]}
      />

      {/* Products */}
      {products.map((item, index) => {
        if (!item) return null;
        const { product, placedProduct, position } = item;
        
        return (
          <ProductMesh
            key={`${product.id}-${index}`}
            product={product}
            placedProduct={placedProduct}
            position={position}
          />
        );
      })}

      {/* Environment */}
      <fog attach="fog" args={['#111827', adjustedDistance * 1.5, adjustedDistance * 3]} />
    </>
  );
});

const ShelfView3D: React.FC = () => {
  const { state } = usePlanogram();
  const { doors, selectedDoorId, selectedEquipmentId, selectedBayId, selectedShelfId } = state;

  const selectedDoor = doors.find(door => door.id === selectedDoorId);
  const selectedEquipment = selectedDoor?.equipment.find(eq => eq.id === selectedEquipmentId);
  const selectedBay = selectedEquipment?.bays.find(bay => bay.id === selectedBayId);
  const selectedShelf = selectedBay?.shelves.find(shelf => shelf.id === selectedShelfId);

  const products = useMemo(() => {
    if (!selectedShelf) return [];

    const SPACING = 2;
    let currentX = -selectedShelf.width / 2 + SPACING;
    let currentZ = -selectedShelf.depth / 2 + SPACING;
    const maxZ = selectedShelf.depth / 2 - SPACING;

    return selectedShelf.products.map((placedProduct) => {
      const product = state.productCatalog.find(p => p.id === placedProduct.productId);
      if (!product) return null;

      const facings = placedProduct.facings || 1;
      const productWidth = product.width * facings;
      
      if (currentX + productWidth > selectedShelf.width / 2 - SPACING) {
        currentX = -selectedShelf.width / 2 + SPACING;
        currentZ += product.depth + SPACING;

        if (currentZ + product.depth > maxZ) {
          return null;
        }
      }

      const position: [number, number, number] = [
        currentX + (productWidth / 2),
        product.height / 2,
        currentZ + (product.depth / 2)
      ];

      currentX += productWidth + SPACING;

      return { product, placedProduct, position };
    }).filter(Boolean);
  }, [selectedShelf, state.productCatalog]);

  if (!selectedShelf) return null;

  return (
    <div className="w-full h-full bg-gray-900">
      <Canvas shadows>
        <Scene shelf={selectedShelf} products={products} />
      </Canvas>
    </div>
  );
};

export default ShelfView3D;