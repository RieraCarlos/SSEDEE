import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayerList from './PlayerList';
import type { NominaMember, MatchEvent, DisciplineConfig } from '@/core/disciplines';

interface LiveRostersProps {
  localPlayers: NominaMember[];
  visitaPlayers: NominaMember[];
  localName: string;
  visitaName: string;
  matchEvents: MatchEvent[];
  isAdmin: boolean;
  onLogEvent: (type: string, team: 'local' | 'visita', player: NominaMember) => void;
  isLoading?: boolean;
  config: DisciplineConfig | null;
}

const LiveRosters: React.FC<LiveRostersProps> = ({ 
  localPlayers, 
  visitaPlayers, 
  localName, 
  visitaName, 
  matchEvents, 
  isAdmin, 
  onLogEvent,
  isLoading,
  config
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<{ player: NominaMember, team: 'local' | 'visita' } | null>(null);

  const isVersus = config?.layoutMode === 'versus' || !config;

  const handlePlayerClick = (player: NominaMember, team: 'local' | 'visita') => {
    if (!isAdmin) return;
    setSelectedPlayer({ player, team });
  };

  const handleAction = (type: string) => {
    if (selectedPlayer) {
      onLogEvent(type, selectedPlayer.team, selectedPlayer.player);
      setSelectedPlayer(null);
    }
  };

  return (
    <div className="w-full relative animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Desktop View: Side by Side or Full Width */}
      <div className="hidden md:flex flex-row gap-8 h-full">
         <PlayerList 
            players={localPlayers} 
            events={matchEvents} 
            teamName={localName} 
            teamType="local"
            isAdmin={isAdmin}
            onLogEvent={(p) => handlePlayerClick(p, 'local')}
            isLoading={isLoading}
            config={config}
         />
         {isVersus && (
           <PlayerList 
              players={visitaPlayers} 
              events={matchEvents} 
              teamName={visitaName} 
              teamType="visita"
              isAdmin={isAdmin}
              onLogEvent={(p) => handlePlayerClick(p, 'visita')}
              isLoading={isLoading}
              config={config}
           />
         )}
      </div>

      {/* Mobile View: Tabs (Only if Versus) */}
      <div className="md:hidden">
        {isVersus ? (
          <Tabs defaultValue="local" className="w-full">
            <TabsList className="bg-[#13161c] border border-gray-800 p-1 w-full flex mb-6 h-12 rounded-xl">
              <TabsTrigger 
                value="local" 
                className="flex-1 data-[state=active]:bg-[var(--active-bg)] data-[state=active]:text-[#13161c] font-black italic uppercase tracking-tighter transition-all"
                style={{ '--active-bg': 'var(--discipline-color)' } as any}
              >
                {localName}
              </TabsTrigger>
              <TabsTrigger 
                value="visita" 
                className="flex-1 data-[state=active]:bg-[var(--active-bg)] data-[state=active]:text-[#13161c] font-black italic uppercase tracking-tighter transition-all"
                style={{ '--active-bg': 'var(--discipline-color)' } as any}
              >
                {visitaName}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="local">
              <PlayerList 
                  players={localPlayers} 
                  events={matchEvents} 
                  teamName={localName} 
                  teamType="local"
                  isAdmin={isAdmin}
                  onLogEvent={(p) => handlePlayerClick(p, 'local')}
                  isLoading={isLoading}
                  config={config}
              />
            </TabsContent>
            <TabsContent value="visita">
              <PlayerList 
                  players={visitaPlayers} 
                  events={matchEvents} 
                  teamName={visitaName} 
                  teamType="visita"
                  isAdmin={isAdmin}
                  onLogEvent={(p) => handlePlayerClick(p, 'visita')}
                  isLoading={isLoading}
                  config={config}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <PlayerList 
              players={localPlayers} 
              events={matchEvents} 
              teamName={localName} 
              teamType="local"
              isAdmin={isAdmin}
              onLogEvent={(p) => handlePlayerClick(p, 'local')}
              isLoading={isLoading}
              config={config}
          />
        )}
      </div>

      {/* Action Dialog (Log Event) */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedPlayer(null)}>
          <div className="bg-[#1d2029] p-8 rounded-3xl border border-white/5 shadow-2xl max-w-sm w-full mx-4 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Design Decor */}
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: 'var(--discipline-color)' }}
            ></div>
            
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1">{selectedPlayer.player.fullname}</h3>
            <p 
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
              style={{ color: 'var(--discipline-color)' }}
            >
              {selectedPlayer.player.posicion || 'JUGADOR'} / {selectedPlayer.team}
            </p>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {(config?.stats || []).map(stat => (
                <Button 
                  key={stat.id} 
                  onClick={() => handleAction(stat.id)} 
                  className="w-full justify-start text-sm h-14 bg-white/5 border border-white/5 transition-all font-black italic tracking-tighter uppercase gap-4 group/btn"
                  onMouseEnter={(e) => {
                    const color = stat.category === 'positive' ? 'var(--discipline-color)' : 
                                stat.category === 'negative' ? '#ef4444' : '#ffffff';
                    e.currentTarget.style.backgroundColor = color;
                    e.currentTarget.style.color = stat.category === 'negative' ? 'white' : '#13161c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  <span className="text-xl">{stat.icon || '⚡'}</span> 
                  {stat.label.toUpperCase()}
                </Button>
              ))}
              
              {/* Fallback for basic actions if config is missing */}
              {(!config || config.stats.length === 0) && (
                <>
                  <Button 
                    onClick={() => handleAction('gol')} 
                    className="w-full justify-start text-sm h-14 bg-white/5 text-white border border-white/5 transition-all font-black italic tracking-tighter uppercase gap-4"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--discipline-color)';
                      e.currentTarget.style.color = '#13161c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = 'white';
                    }}
                  >
                    <span className="text-xl">⚽</span> GOL REALIZADO
                  </Button>
                  <Button onClick={() => handleAction('amarilla')} className="w-full justify-start text-sm h-14 bg-white/5 hover:bg-yellow-400 hover:text-[#13161c] text-white border border-white/5 transition-all font-black italic tracking-tighter uppercase gap-4">
                    <div className="w-4 h-6 bg-yellow-400 rounded-sm shadow-md"></div> TARJETA AMARILLA
                  </Button>
                </>
              )}
            </div>
            
            <Button onClick={() => setSelectedPlayer(null)} variant="ghost" className="w-full mt-6 text-gray-500 hover:text-white uppercase text-[10px] font-bold tracking-widest">
              CANCELAR ACCIÓN
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveRosters;
