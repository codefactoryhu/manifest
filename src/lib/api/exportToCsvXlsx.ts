import type { BaseResource } from '$lib/api/baseResources';
import type { Table } from '@tanstack/svelte-table';
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';

function createWorkbookFromTable(table: Table<BaseResource>, applyFilters = true) {
	const wb = new ExcelJS.Workbook();
	const ws = wb.addWorksheet('Sheet 1');

	const lastHeaderGroup = table.getHeaderGroups().at(-1);
	if (!lastHeaderGroup) {
		console.log('No header groups found', table.getHeaderGroups());
		return;
	}

	ws.columns = lastHeaderGroup.headers
		.filter((h) => h.column.getIsVisible())
		.map((header) => {
			return {
				header: header.column.columnDef.header as string,
				key: header.id,
				width: 20
			};
		});

	const exportRows = applyFilters ? table.getFilteredRowModel().rows : table.getCoreRowModel().rows;

	exportRows.forEach((row) => {
		const cells = row.getVisibleCells();
		const values = cells.map((cell) => cell.getValue() ?? '');
		ws.addRow(values);
	});

	ws.getRow(1).eachCell((cell) => {
		cell.font = { bold: true };
	});

	return wb;
}

function createWorkbookFromArray(table: { id: string; api_key: string }[], headers: string[]) {
	const wb = new ExcelJS.Workbook();
	const ws = wb.addWorksheet('Sheet 1');

	const lastHeaderGroup = table.map((item) => item.id);
	if (!lastHeaderGroup) {
		console.log(
			'No headers found',
			table.map((item) => item.id)
		);
		return;
	}

	ws.columns = headers.map((header) => {
		return {
			header: header as string,
			key: header as string,
			width: 30
		};
	});

	table.forEach((row) => {
		ws.addRow({
			Id: row.id,
			ApiKey: row.api_key
		});
	});

	ws.getRow(1).eachCell((cell) => {
		cell.font = { bold: true };
	});

	return wb;
}

export async function exportXlsx(
	table: Table<BaseResource>,
	filename: string,
	applyFilters = true
) {
	const wb = createWorkbookFromTable(table, applyFilters);
	const dateNow: string = getFormattedDateTime();
	if (wb !== undefined) {
		const xlsxBuf = await wb.xlsx.writeBuffer();
		FileSaver.saveAs(new Blob([xlsxBuf]), `${filename}_${dateNow}.xlsx`);
	}
}

export async function exportKeysXlsx(
	table: { id: string; api_key: string }[],
	filename: string,
	headers: string[]
) {
	const wb = createWorkbookFromArray(table, headers);
	const dateNow: string = getFormattedDateTime();
	if (wb !== undefined) {
		const xlsxBuf = await wb.xlsx.writeBuffer();
		FileSaver.saveAs(new Blob([xlsxBuf]), `${filename}_${dateNow}.xlsx`);
	}
}

export async function exportCsV(table: Table<BaseResource>, filename: string, applyFilters = true) {
	const wb = createWorkbookFromTable(table, applyFilters);
	const dateNow: string = getFormattedDateTime();
	if (wb !== undefined) {
		const csvBuf = await wb.csv.writeBuffer();
		FileSaver.saveAs(new Blob([csvBuf]), `${filename}_${dateNow}.csv`);
	}
}

export async function exportKeysCsv(
	table: { id: string; api_key: string }[],
	filename: string,
	headers: string[]
) {
	const wb = createWorkbookFromArray(table, headers);
	const dateNow: string = getFormattedDateTime();
	if (wb !== undefined) {
		const csvBuf = await wb.csv.writeBuffer();
		FileSaver.saveAs(new Blob([csvBuf]), `${filename}_${dateNow}.csv`);
	}
}

function getFormattedDateTime(): string {
	const currentDateTime: Date = new Date();

	const year: number = currentDateTime.getFullYear();
	const month: number = currentDateTime.getMonth() + 1; // Months are zero-based
	const day: number = currentDateTime.getDate();
	const hours: number = currentDateTime.getHours();
	const minutes: number = currentDateTime.getMinutes();
	const seconds: number = currentDateTime.getSeconds();

	// Pad single-digit months, days, hours, minutes, and seconds with a leading zero
	const formattedDateTime: string = `${year}_${padZero(month)}_${padZero(day)}-${padZero(hours)}_${padZero(minutes)}_${padZero(seconds)}`;

	return formattedDateTime;
}

function padZero(value: number): string {
	return value < 10 ? `0${value}` : `${value}`;
}
