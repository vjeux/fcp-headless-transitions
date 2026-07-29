
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

000000000002ff06 <__ZN8OZSpline13getNextVertexERK6CMTime>:
   2ff06: 48 8b 47 10                  	movq	0x10(%rdi), %rax
   2ff0a: 48 3b 47 18                  	cmpq	0x18(%rdi), %rax
   2ff0e: 0f 84 cd 00 00 00            	je	0x2ffe1 <__ZN8OZSpline13getNextVertexERK6CMTime+0xdb>
   2ff14: 55                           	pushq	%rbp
   2ff15: 48 89 e5                     	movq	%rsp, %rbp
   2ff18: 41 57                        	pushq	%r15
   2ff1a: 41 56                        	pushq	%r14
   2ff1c: 41 55                        	pushq	%r13
   2ff1e: 41 54                        	pushq	%r12
   2ff20: 53                           	pushq	%rbx
   2ff21: 48 83 ec 48                  	subq	$0x48, %rsp
   2ff25: 49 89 ff                     	movq	%rdi, %r15
   2ff28: 4c 8b 67 28                  	movq	0x28(%rdi), %r12
   2ff2c: 4c 39 67 30                  	cmpq	%r12, 0x30(%rdi)
   2ff30: 0f 84 a7 00 00 00            	je	0x2ffdd <__ZN8OZSpline13getNextVertexERK6CMTime+0xd7>
   2ff36: 49 89 f6                     	movq	%rsi, %r14
   2ff39: 4c 8b 2d 80 a5 09 00         	movq	0x9a580(%rip), %r13     ## 0xca4c0 <_tan+0xca4c0>
   2ff40: 31 db                        	xorl	%ebx, %ebx
   2ff42: 49 8b 04 24                  	movq	(%r12), %rax
   2ff46: 49 8b 4e 10                  	movq	0x10(%r14), %rcx
   2ff4a: 48 89 4d d0                  	movq	%rcx, -0x30(%rbp)
   2ff4e: 41 0f 10 06                  	movups	(%r14), %xmm0
   2ff52: 0f 29 45 c0                  	movaps	%xmm0, -0x40(%rbp)
   2ff56: 48 8b 4d d0                  	movq	-0x30(%rbp), %rcx
   2ff5a: 48 89 4c 24 28               	movq	%rcx, 0x28(%rsp)
   2ff5f: 0f 28 45 c0                  	movaps	-0x40(%rbp), %xmm0
   2ff63: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   2ff68: 48 8b 48 20                  	movq	0x20(%rax), %rcx
   2ff6c: 48 89 4c 24 10               	movq	%rcx, 0x10(%rsp)
   2ff71: 0f 10 40 10                  	movups	0x10(%rax), %xmm0
   2ff75: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   2ff79: e8 02 cb 07 00               	callq	0xaca80 <_tan+0xaca80>
   2ff7e: 85 c0                        	testl	%eax, %eax
   2ff80: 7f 62                        	jg	0x2ffe4 <__ZN8OZSpline13getNextVertexERK6CMTime+0xde>
   2ff82: 49 8b 04 24                  	movq	(%r12), %rax
   2ff86: 49 8b 4d 10                  	movq	0x10(%r13), %rcx
   2ff8a: 48 89 4d d0                  	movq	%rcx, -0x30(%rbp)
   2ff8e: 41 0f 10 45 00               	movups	(%r13), %xmm0
   2ff93: 0f 29 45 c0                  	movaps	%xmm0, -0x40(%rbp)
   2ff97: 48 8b 4d d0                  	movq	-0x30(%rbp), %rcx
   2ff9b: 48 89 4c 24 28               	movq	%rcx, 0x28(%rsp)
   2ffa0: 0f 28 45 c0                  	movaps	-0x40(%rbp), %xmm0
   2ffa4: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   2ffa9: 48 8b 48 20                  	movq	0x20(%rax), %rcx
   2ffad: 48 89 4c 24 10               	movq	%rcx, 0x10(%rsp)
   2ffb2: 0f 10 40 10                  	movups	0x10(%rax), %xmm0
   2ffb6: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   2ffba: e8 c1 ca 07 00               	callq	0xaca80 <_tan+0xaca80>
   2ffbf: 85 c0                        	testl	%eax, %eax
   2ffc1: 0f 94 c1                     	sete	%cl
   2ffc4: 84 d9                        	testb	%bl, %cl
   2ffc6: 75 1c                        	jne	0x2ffe4 <__ZN8OZSpline13getNextVertexERK6CMTime+0xde>
   2ffc8: 85 c0                        	testl	%eax, %eax
   2ffca: 0f 94 c0                     	sete	%al
   2ffcd: 08 c3                        	orb	%al, %bl
   2ffcf: 49 83 c4 08                  	addq	$0x8, %r12
   2ffd3: 4d 3b 67 30                  	cmpq	0x30(%r15), %r12
   2ffd7: 0f 85 65 ff ff ff            	jne	0x2ff42 <__ZN8OZSpline13getNextVertexERK6CMTime+0x3c>
   2ffdd: 31 c0                        	xorl	%eax, %eax
   2ffdf: eb 07                        	jmp	0x2ffe8 <__ZN8OZSpline13getNextVertexERK6CMTime+0xe2>
   2ffe1: 31 c0                        	xorl	%eax, %eax
   2ffe3: c3                           	retq
   2ffe4: 49 8b 04 24                  	movq	(%r12), %rax
   2ffe8: 48 83 c4 48                  	addq	$0x48, %rsp
   2ffec: 5b                           	popq	%rbx
   2ffed: 41 5c                        	popq	%r12
   2ffef: 41 5d                        	popq	%r13
   2fff1: 41 5e                        	popq	%r14
   2fff3: 41 5f                        	popq	%r15
   2fff5: 5d                           	popq	%rbp
   2fff6: c3                           	retq
   2fff7: 90                           	nop
