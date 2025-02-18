# surveywebappbyfabian.github.io
Can be handy when conducting on site survey computations. 
# Survey App

A comprehensive web application for various surveying and geodetic calculations.

## Features

This app includes the following computations and conversions:

1. Forward Computation
2. Backward Computation
3. Resection
4. Intersection
5. Area Calculation
6. Long/Lat ⇄ UTM Conversion
7. DD ⇄ DMS Conversion
8. Quadrilateral Area
## Usage

Each computation/conversion has its own dedicated page with intuitive input fields and clear instructions.

### Forward Computation
Calculate the coordinates of a new point given a starting point, distance, and bearing.

### Backward Computation
Calculate the distance and bearing between two known points.

### Resection
Determine the position of an unknown point using observations to three known points.

### Intersection
Find the coordinates of an unknown point using angles measured from two known points.

### Area Calculation
Calculate the area of a polygon given its vertex coordinates.

### Long/Lat ⇄ UTM Conversion
Convert between geographic (longitude/latitude) and UTM (Universal Transverse Mercator) coordinates.

### DD ⇄ DMS Conversion
Convert between decimal degrees and degrees, minutes, seconds formats.

### Quadrilateral Area
Here, Brahmagupta’s formula is used to calculate the area of a cyclic quadrilateral (a quadrilateral where all vertices lie on a single circle). The formula is:
Area=sqrt[(s−a)(s−b)(s−c)(s−d)]
where ( s ) is the semiperimeter of the quadrilateral, calculated as:
s=(a+b+c+d​)/2
Here, ( a ), ( b ), ( c ), and ( d ) are the lengths of the sides of the quadrilateral.

## Installation

1. Clone this repository
2. Open `index.html` in your web browser

## Technologies Used

- HTML5
- CSS3
- JavaScript

## Contributing

Contributions, issues, and feature requests are welcome.


## Author

Fabian Wambua - (https://github.com/Wambua-F)

## Acknowledgments

Resource: https://www.unsw.edu.au/content/dam/pdfs/engineering/civil-environmental/research-reports/civil-eng-and-enviro-research-areas-surveying/2021-09-Surveying_Computations_TextbookJan2019.pdf
