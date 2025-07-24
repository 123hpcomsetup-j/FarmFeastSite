import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface CustomScript {
  id: number;
  name: string;
  description: string;
  script: string;
  location: 'head' | 'body_start' | 'body_end';
  isActive: boolean;
  createdAt: string;
}

export default function CustomScripts() {
  const { data: scripts = [] } = useQuery({
    queryKey: ["/api/custom-scripts"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  }) as { data: CustomScript[] };

  // Debug log for production
  console.log("🔧 CustomScripts component mounted in", process.env.NODE_ENV || 'production');

  useEffect(() => {
    console.log("🔧 CustomScripts: Loading scripts", scripts);
    
    // Force a re-fetch in production if no scripts but API should have them
    if (!scripts.length) {
      console.log("⚠️ CustomScripts: No scripts found - this might be a production caching issue");
      
      // In production, try to manually fetch scripts
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        fetch('/api/custom-scripts')
          .then(res => res.json())
          .then(data => {
            console.log("🔧 Manual fetch result:", data);
            if (data.length > 0) {
              console.log("⚠️ Found scripts via manual fetch - query cache issue detected");
            }
          })
          .catch(err => console.error("❌ Manual fetch failed:", err));
      }
      return;
    }

    // Remove existing custom scripts to avoid duplicates
    const existingScripts = document.querySelectorAll('[data-custom-script]');
    existingScripts.forEach(script => script.remove());

    scripts.forEach((scriptConfig) => {
      console.log(`🔧 CustomScripts: Processing script "${scriptConfig.name}"`, {
        isActive: scriptConfig.isActive,
        location: scriptConfig.location,
        hostname: window.location.hostname,
        script: scriptConfig.script?.substring(0, 100) + "..."
      });

      if (!scriptConfig.isActive) {
        console.log(`CustomScripts: Skipping inactive script "${scriptConfig.name}"`);
        return;
      }

      try {
        // Create a container div to safely parse HTML content using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(scriptConfig.script, 'text/html');
        const container = document.createElement('div');
        container.setAttribute('data-custom-script', scriptConfig.id.toString());
        container.setAttribute('data-script-name', scriptConfig.name);
        
        // Safely move parsed nodes to container (also check head nodes for scripts in head)
        const allNodes = [...Array.from(doc.head.childNodes), ...Array.from(doc.body.childNodes)];
        allNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            container.appendChild(node.cloneNode(true));
          }
        });
        console.log(`CustomScripts: Parsed HTML for "${scriptConfig.name}":`, container.childNodes.length, "nodes");
        
        // Get the target location
        let targetElement;
        switch (scriptConfig.location) {
          case 'head':
            targetElement = document.head;
            break;
          case 'body_start':
            targetElement = document.body;
            break;
          case 'body_end':
          default:
            targetElement = document.body;
            break;
        }

        // Process each child element in the container
        Array.from(container.childNodes).forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            if (element.tagName === 'SCRIPT') {
              // Create a new script element
              const newScript = document.createElement('script');
              newScript.setAttribute('data-custom-script', scriptConfig.id.toString());
              
              // Copy attributes
              Array.from(element.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
              });
              
              // Set content or src
              if (element.getAttribute('src')) {
                newScript.src = element.getAttribute('src')!;
                console.log(`CustomScripts: Adding external script from "${element.getAttribute('src')}" to ${scriptConfig.location}`);
              } else {
                newScript.textContent = element.textContent;
                console.log(`CustomScripts: Adding inline script to ${scriptConfig.location}:`, element.textContent?.substring(0, 100) + "...");
                
                // For Tawk.to scripts, ensure proper execution
                if (element.textContent?.includes('Tawk_API')) {
                  newScript.onload = () => {
                    console.log('✅ CustomScripts: Tawk.to script executed successfully');
                  };
                  newScript.onerror = (error) => {
                    console.error('❌ CustomScripts: Tawk.to script failed to load:', error);
                  };
                }
              }
              
              // Insert into correct location
              if (scriptConfig.location === 'body_start') {
                targetElement.insertBefore(newScript, targetElement.firstChild);
              } else {
                targetElement.appendChild(newScript);
              }
              
              console.log(`CustomScripts: Script "${scriptConfig.name}" added to ${scriptConfig.location}`);
              
              // For Tawk.to and LiveChat, trigger initialization with multiple checks
              if (scriptConfig.name.toLowerCase().includes('chat')) {
                // Check immediately and also with delays for different loading patterns
                const checkTawkStatus = () => {
                  if (typeof window !== 'undefined') {
                    const hasTawkAPI = !!(window as any).Tawk_API;
                    const hasTawkCore = !!(window as any).$_Tawk;
                    const hasLiveChat = !!(window as any).__lc;
                    
                    console.log(`🔧 Tawk.to Status Check:`, {
                      hostname: window.location.hostname,
                      Tawk_API: hasTawkAPI,
                      $_Tawk: hasTawkCore,
                      LiveChat: hasLiveChat
                    });
                    
                    if (hasTawkAPI) {
                      console.log('✅ CustomScripts: Tawk.to widget loaded successfully!');
                      // Force show the widget
                      if ((window as any).Tawk_API.showWidget) {
                        (window as any).Tawk_API.showWidget();
                      }
                      // Force widget to be maximized/visible
                      if ((window as any).Tawk_API.maximize) {
                        (window as any).Tawk_API.maximize();
                      }
                      return true;
                    }
                    
                    if (hasTawkCore) {
                      console.log('✅ CustomScripts: Tawk.to core loaded!');
                    }
                    
                    if (hasLiveChat) {
                      console.log('✅ CustomScripts: LiveChat widget loaded successfully!');
                      return true;
                    }
                  }
                  return false;
                };
                
                // Check immediately
                checkTawkStatus();
                
                // Check with increasing delays for slow loading networks
                setTimeout(checkTawkStatus, 1000);
                setTimeout(checkTawkStatus, 3000);
                setTimeout(checkTawkStatus, 5000);
              }
            } else {
              // For non-script elements (like noscript), clone and append
              const clonedElement = element.cloneNode(true) as Element;
              clonedElement.setAttribute('data-custom-script', scriptConfig.id.toString());
              
              if (scriptConfig.location === 'body_start') {
                targetElement.insertBefore(clonedElement, targetElement.firstChild);
              } else {
                targetElement.appendChild(clonedElement);
              }
            }
          } else if (node.nodeType === Node.COMMENT_NODE) {
            // Handle HTML comments
            const commentClone = node.cloneNode(true);
            if (scriptConfig.location === 'body_start') {
              targetElement.insertBefore(commentClone, targetElement.firstChild);
            } else {
              targetElement.appendChild(commentClone);
            }
          }
        });
        
      } catch (error) {
        console.error(`Failed to load custom script "${scriptConfig.name}":`, error);
      }
    });

    // Cleanup function
    return () => {
      const scriptsToRemove = document.querySelectorAll('[data-custom-script]');
      scriptsToRemove.forEach(script => script.remove());
    };
  }, [scripts]);

  return null; // This component doesn't render anything visible
}