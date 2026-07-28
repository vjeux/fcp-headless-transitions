
/tmp/Helium.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

0000000000055300 <__ZN25HRasterizerTextureNoColorD0Ev>:
   55300: 55                           	pushq	%rbp
   55301: 48 89 e5                     	movq	%rsp, %rbp
   55304: 53                           	pushq	%rbx
   55305: 50                           	pushq	%rax
   55306: 48 89 fb                     	movq	%rdi, %rbx
   55309: e8 a2 bc 30 00               	callq	0x360fb0 <__ZN27HgcRasterizerTextureNoColorD2Ev>
   5530e: 48 89 df                     	movq	%rbx, %rdi
   55311: 48 83 c4 08                  	addq	$0x8, %rsp
   55315: 5b                           	popq	%rbx
   55316: 5d                           	popq	%rbp
   55317: e9 f4 bb 14 00               	jmp	0x1a0f10 <__ZN8HGObjectdlEPv>
   5531c: 0f 1f 40 00                  	nopl	(%rax)
