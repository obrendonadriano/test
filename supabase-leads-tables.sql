create extension if not exists pgcrypto;

create table if not exists public.leads_veiculo (
  id uuid primary key default gen_random_uuid(),
  nome text not null default '',
  cpf text not null default '',
  telefone text not null default '',
  data_nascimento date,
  placa text not null default '',
  ano integer not null default 0,
  valor_desejado numeric not null default 0,
  status text not null default 'Novo',
  created_at timestamptz not null default now()
);

create table if not exists public.leads_imovel (
  id uuid primary key default gen_random_uuid(),
  nome text not null default '',
  cpf text not null default '',
  telefone text not null default '',
  data_nascimento date,
  placa text not null default '',
  ano integer not null default 0,
  valor_desejado numeric not null default 0,
  status text not null default 'Novo',
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_destinations (
  id uuid primary key default gen_random_uuid(),
  label text not null default '',
  phone text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists leads_veiculo_created_at_idx on public.leads_veiculo (created_at desc);
create index if not exists leads_imovel_created_at_idx on public.leads_imovel (created_at desc);
create index if not exists whatsapp_destinations_created_at_idx on public.whatsapp_destinations (created_at asc);

do $$
begin
  if to_regclass('public.leads_financiamento') is not null then
    insert into public.leads_veiculo (
      id, nome, cpf, telefone, data_nascimento, placa, ano, valor_desejado, status, created_at
    )
    select
      id,
      coalesce(nome, ''),
      coalesce(cpf, ''),
      coalesce(telefone, ''),
      data_nascimento,
      coalesce(placa, ''),
      coalesce(ano, 0),
      coalesce(valor_desejado, 0),
      coalesce(status, 'Novo'),
      created_at
    from public.leads_financiamento
    where placa is null or placa not like 'IMOVEL-%'
    on conflict (id) do nothing;

    insert into public.leads_imovel (
      id, nome, cpf, telefone, data_nascimento, placa, ano, valor_desejado, status, created_at
    )
    select
      id,
      coalesce(nome, ''),
      coalesce(cpf, ''),
      coalesce(telefone, ''),
      data_nascimento,
      coalesce(placa, ''),
      coalesce(ano, 0),
      coalesce(valor_desejado, 0),
      coalesce(status, 'Novo'),
      created_at
    from public.leads_financiamento
    where placa like 'IMOVEL-%'
    on conflict (id) do nothing;
  end if;
end $$;

alter table public.leads_veiculo enable row level security;
alter table public.leads_imovel enable row level security;
alter table public.whatsapp_destinations enable row level security;

drop policy if exists "Permitir inserir leads de veiculo" on public.leads_veiculo;
drop policy if exists "Permitir atualizar leads de veiculo" on public.leads_veiculo;
drop policy if exists "Permitir ler leads de veiculo" on public.leads_veiculo;
drop policy if exists "Permitir excluir leads de veiculo" on public.leads_veiculo;

drop policy if exists "Permitir inserir leads de imovel" on public.leads_imovel;
drop policy if exists "Permitir atualizar leads de imovel" on public.leads_imovel;
drop policy if exists "Permitir ler leads de imovel" on public.leads_imovel;
drop policy if exists "Permitir excluir leads de imovel" on public.leads_imovel;

drop policy if exists "Permitir gerenciar whatsapps" on public.whatsapp_destinations;

create policy "Permitir inserir leads de veiculo"
on public.leads_veiculo
for insert
to anon
with check (true);

create policy "Permitir atualizar leads de veiculo"
on public.leads_veiculo
for update
to anon
using (true)
with check (true);

create policy "Permitir ler leads de veiculo"
on public.leads_veiculo
for select
to anon
using (true);

create policy "Permitir excluir leads de veiculo"
on public.leads_veiculo
for delete
to anon
using (true);

create policy "Permitir inserir leads de imovel"
on public.leads_imovel
for insert
to anon
with check (true);

create policy "Permitir atualizar leads de imovel"
on public.leads_imovel
for update
to anon
using (true)
with check (true);

create policy "Permitir ler leads de imovel"
on public.leads_imovel
for select
to anon
using (true);

create policy "Permitir excluir leads de imovel"
on public.leads_imovel
for delete
to anon
using (true);

create policy "Permitir gerenciar whatsapps"
on public.whatsapp_destinations
for all
to anon
using (true)
with check (true);
