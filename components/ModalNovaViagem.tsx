"use client";

import React, { useState } from "react";
import { criarEventoFrota } from "../app/actions/eventos";

export default function ModalNovaViagem({ veiculos = [], motoristas = [] }: { veiculos: any[], motoristas: any[] }) {
    const [isOpen, setIsOpen] = useState(false);

    async function handleSubmit(formData: FormData) {
        const res = await criarEventoFrota(formData);
        if (res?.erro) {
            alert(res.erro); // Falha na trava anti-choque
        } else if (res?.sucesso) {
            setIsOpen(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-colors"
            >
                + Nova Viagem
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative">
                        <h2 className="text-xl font-bold text-gray-800 mb-5">Agendar Nova Viagem</h2>

                        <form action={handleSubmit} className="flex flex-col space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Título da Viagem</label>
                                <input required type="text" name="titulo" className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Viagem para Gramado" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Veículo</label>
                                <select required name="veiculoId" className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Selecione um veículo</option>
                                    {veiculos.map(v => (
                                        <option key={v.id} value={v.id}>{v.prefixo}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Motorista</label>
                                <select required name="motoristaId" className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Selecione o motorista</option>
                                    {motoristas.map((m: any) => (
                                        <option key={m.id} value={m.id}>{m.nome_completo}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Início</label>
                                    <input required type="datetime-local" name="inicio" className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fim</label>
                                    <input required type="datetime-local" name="fim" className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-8 pt-2">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors">Salvar Agendamento</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
