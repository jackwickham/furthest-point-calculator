use std::{f32::consts::PI, collections::BinaryHeap};
use wasm_bindgen::prelude::*;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

const R: f32 = 6371.0; // km

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Point {
    lat: f32, // rad
    long: f32, // rad
}

#[wasm_bindgen]
impl Point {
    pub fn create_degrees(lat: f32, long: f32) -> Point {
        Point {
            lat: lat * PI / 180.0,
            long: long * PI / 180.0,
        }
    }

    pub fn create_radians(lat: f32, long: f32) -> Point {
        Point { lat, long }
    }

    pub fn get_lat_degrees(&self) -> f32 {
        return self.lat * 180.0 / PI;
    }

    pub fn get_long_degrees(&self) -> f32 {
        return self.long * 180.0 / PI;
    }
}

struct OptimizedPoint {
    sin_lat: f32,
    cos_lat: f32,
    sin_long: f32,
    cos_long: f32,
}

impl From<Point> for OptimizedPoint {
    fn from(p: Point) -> Self {
        OptimizedPoint {
            sin_lat: p.lat.sin(),
            cos_lat: p.lat.cos(),
            sin_long: p.long.sin(),
            cos_long: p.long.cos()
        }
    }
}

impl From<OptimizedPoint> for Point {
    fn from(p: OptimizedPoint) -> Self {
        Point {
            lat: p.sin_lat.atan2(p.cos_lat),
            long: p.sin_long.atan2(p.cos_long),
        }
    }
}

#[wasm_bindgen]
pub struct Points(Vec<Point>);

#[wasm_bindgen]
impl Points {
    pub fn new() -> Points {
        Points(Vec::new())
    }

    pub fn push(&mut self, point: Point) {
        self.0.push(point);
    }
}

#[derive(Clone)]
struct WeightedPoint {
    point: Point,
    weight: f32,
}

impl PartialEq for WeightedPoint {
    fn eq(&self, other: &Self) -> bool {
        self.point.lat == other.point.lat && self.point.long == other.point.long && self.weight == other.weight
    }
}

impl Eq for WeightedPoint {}

impl Ord for WeightedPoint {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.weight.total_cmp(&other.weight).then(self.point.lat.total_cmp(&other.point.lat)).then(self.point.long.total_cmp(&other.point.long))
    }
}

impl PartialOrd for WeightedPoint {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

#[wasm_bindgen]
pub fn find_most_distant_point(points: &Points) -> Point {
    let candidates = find_best_points(float_iter(-PI / 2.0, PI / 2.0, 180), || float_iter(-PI, PI, 360), points, R * PI / 180.0);

    let mut best = None;
    for candidate in candidates {
        let best_this_candidate = find_best_points(
            float_iter(candidate.point.lat - PI / 360.0, candidate.point.lat + PI / 360.0, 100),
            || float_iter(candidate.point.long - PI / 360.0, candidate.point.long + PI / 360.0, 100),
            points,
            0.0)
            .get(0).unwrap().clone();
        best = match best {
            None => Some(best_this_candidate),
            Some(existing) if existing.weight < best_this_candidate.weight => Some(best_this_candidate),
            _ => best
        };
    }

    best.unwrap().point
}

fn find_best_points<I, J, F>(lat_iter: I, long_iter: F, points: &Points, retain_allowance: f32) -> Vec<WeightedPoint>
where I : Iterator<Item = f32>, J : Iterator<Item = f32>, F : Fn() -> J {
    let mut heap: BinaryHeap<WeightedPoint> = BinaryHeap::new();
    for lat in lat_iter {
        for long in long_iter() {
            let p = Point::create_radians(lat as f32, long as f32);
            let op: OptimizedPoint = p.into();
            let mut min_distance = f32::INFINITY;
            for other in &points.0 {
                min_distance = min_distance.min(distance(&other.clone().into(), &op));
            }

            let should_insert = match heap.peek() {
                None => true,
                Some(ref existing) => existing.weight < min_distance + retain_allowance
            };

            if should_insert {
                heap.push(WeightedPoint{
                    point: p,
                    weight: min_distance,
                });
            }
        }
    }

    let threshold = heap.peek().unwrap().weight - retain_allowance;
    let mut result = Vec::new();
    while let Some(elem) = heap.pop() {
        if elem.weight < threshold {
            break;
        }
        result.push(elem);
    }

    return result;
}

fn distance(p1: &OptimizedPoint, p2: &OptimizedPoint) -> f32 {
    R * (p1.cos_lat * p2.cos_lat * (p1.cos_long * p2.cos_long + p1.sin_long * p2.sin_long) + p1.sin_lat * p2.sin_lat).acos()
}

fn float_iter(lb: f32, ub: f32, steps: u16) -> impl Iterator<Item = f32> {
    let step_size = (ub - lb) / steps as f32;
    (0..=steps).map(move |n| lb + step_size * (n as f32))
}
