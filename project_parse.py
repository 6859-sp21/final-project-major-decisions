import csv
import math

def numericalize(number_string):
	if number_string == '':
		return 0
	else:
		return float(number_string)
def get_rounded(number):
	number = numericalize(number)
	return round(number)

def parse_raw_data():
	target_index = [8, 9, 10, 11, 12, 13, 14] # ID, case number, FBI Code, updated On
	header = []
	rows =[]

	with open('data/airlines.csv') as csv_file:
		csv_reader = csv.reader(csv_file, delimiter=',')
		line_count,omit_count = 0,0
		for row in csv_reader:
			if line_count == 0:
				print(f'Column names are {", ".join(row)}') #Sex,Year,Age,People
				header=row
				line_count += 1
			else:
				# count indexes: 8, 9, 10, 11, 12
				line_count += 1
				processed_row =[]
				carrier_ct, weather_ct, nas_ct, security_ct, late_aircraft_ct = row[8],row[9],row[10],row[11],row[12]
				count_row = [carrier_ct, weather_ct, nas_ct, security_ct, late_aircraft_ct]
				temp_row = list(map(get_rounded, count_row))
				total_sum = sum(temp_row)

				for i in range(0,len(row)):
					if i == 7:
						processed_row.append(total_sum)
					elif i in target_index:
						processed_row.append(round(numericalize(row[i])))
					else: 
						processed_row.append(row[i])
				rows.append(processed_row)

	with open('data/airlines_processed.csv', 'w') as csv_file:
		csvwriter = csv.writer(csv_file)
		csvwriter.writerow(header)
		csvwriter.writerows(rows)  
	print(header)

parse_raw_data()