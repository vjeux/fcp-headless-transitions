
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

000000000002f910 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime>:
   2f910: 55                           	pushq	%rbp
   2f911: 48 89 e5                     	movq	%rsp, %rbp
   2f914: 41 57                        	pushq	%r15
   2f916: 41 56                        	pushq	%r14
   2f918: 41 55                        	pushq	%r13
   2f91a: 41 54                        	pushq	%r12
   2f91c: 53                           	pushq	%rbx
   2f91d: 48 83 ec 38                  	subq	$0x38, %rsp
   2f921: 49 89 cf                     	movq	%rcx, %r15
   2f924: 48 89 d3                     	movq	%rdx, %rbx
   2f927: 49 89 f4                     	movq	%rsi, %r12
   2f92a: 49 89 fe                     	movq	%rdi, %r14
   2f92d: 4c 8b 2e                     	movq	(%rsi), %r13
   2f930: 4c 89 e8                     	movq	%r13, %rax
   2f933: 48 85 d2                     	testq	%rdx, %rdx
   2f936: 74 0b                        	je	0x2f943 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x33>
   2f938: 48 c7 03 00 00 00 00         	movq	$0x0, (%rbx)
   2f93f: 49 8b 04 24                  	movq	(%r12), %rax
   2f943: 49 8b 4e 30                  	movq	0x30(%r14), %rcx
   2f947: 48 39 c8                     	cmpq	%rcx, %rax
   2f94a: 0f 84 90 00 00 00            	je	0x2f9e0 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xd0>
   2f950: 41 80 7e 70 00               	cmpb	$0x0, 0x70(%r14)
   2f955: 74 2b                        	je	0x2f982 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x72>
   2f957: 48 8b 30                     	movq	(%rax), %rsi
   2f95a: 4c 89 f7                     	movq	%r14, %rdi
   2f95d: e8 4a 04 00 00               	callq	0x2fdac <__ZN8OZSpline18getValidVertexIterEPv>
   2f962: 49 8b 4e 50                  	movq	0x50(%r14), %rcx
   2f966: 48 39 c8                     	cmpq	%rcx, %rax
   2f969: 74 79                        	je	0x2f9e4 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xd4>
   2f96b: 48 83 c0 08                  	addq	$0x8, %rax
   2f96f: 48 39 c8                     	cmpq	%rcx, %rax
   2f972: 74 70                        	je	0x2f9e4 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xd4>
   2f974: 48 85 db                     	testq	%rbx, %rbx
   2f977: 0f 84 82 00 00 00            	je	0x2f9ff <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xef>
   2f97d: 48 8b 08                     	movq	(%rax), %rcx
   2f980: eb 76                        	jmp	0x2f9f8 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xe8>
   2f982: 49 83 c5 08                  	addq	$0x8, %r13
   2f986: 49 39 cd                     	cmpq	%rcx, %r13
   2f989: 74 55                        	je	0x2f9e0 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xd0>
   2f98b: 49 8b 7d 00                  	movq	(%r13), %rdi
   2f98f: 48 8b 07                     	movq	(%rdi), %rax
   2f992: 4c 89 fe                     	movq	%r15, %rsi
   2f995: ff 90 88 00 00 00            	callq	*0x88(%rax)
   2f99b: 84 c0                        	testb	%al, %al
   2f99d: 74 37                        	je	0x2f9d6 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xc6>
   2f99f: 49 8b 45 00                  	movq	(%r13), %rax
   2f9a3: 49 8b 0c 24                  	movq	(%r12), %rcx
   2f9a7: 48 8b 09                     	movq	(%rcx), %rcx
   2f9aa: 48 8b 51 20                  	movq	0x20(%rcx), %rdx
   2f9ae: 48 89 54 24 28               	movq	%rdx, 0x28(%rsp)
   2f9b3: 0f 10 41 10                  	movups	0x10(%rcx), %xmm0
   2f9b7: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   2f9bc: 48 8b 48 20                  	movq	0x20(%rax), %rcx
   2f9c0: 48 89 4c 24 10               	movq	%rcx, 0x10(%rsp)
   2f9c5: 0f 10 40 10                  	movups	0x10(%rax), %xmm0
   2f9c9: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   2f9cd: e8 ae d0 07 00               	callq	0xaca80 <_tan+0xaca80>
   2f9d2: 85 c0                        	testl	%eax, %eax
   2f9d4: 75 19                        	jne	0x2f9ef <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xdf>
   2f9d6: 49 83 c5 08                  	addq	$0x8, %r13
   2f9da: 4d 3b 6e 30                  	cmpq	0x30(%r14), %r13
   2f9de: 75 ab                        	jne	0x2f98b <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x7b>
   2f9e0: 31 c0                        	xorl	%eax, %eax
   2f9e2: eb 1d                        	jmp	0x2fa01 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xf1>
   2f9e4: 31 c0                        	xorl	%eax, %eax
   2f9e6: 48 85 db                     	testq	%rbx, %rbx
   2f9e9: 74 16                        	je	0x2fa01 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xf1>
   2f9eb: 31 c9                        	xorl	%ecx, %ecx
   2f9ed: eb 0b                        	jmp	0x2f9fa <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xea>
   2f9ef: 48 85 db                     	testq	%rbx, %rbx
   2f9f2: 74 0b                        	je	0x2f9ff <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xef>
   2f9f4: 49 8b 4d 00                  	movq	(%r13), %rcx
   2f9f8: b0 01                        	movb	$0x1, %al
   2f9fa: 48 89 0b                     	movq	%rcx, (%rbx)
   2f9fd: eb 02                        	jmp	0x2fa01 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xf1>
   2f9ff: b0 01                        	movb	$0x1, %al
   2fa01: 48 83 c4 38                  	addq	$0x38, %rsp
   2fa05: 5b                           	popq	%rbx
   2fa06: 41 5c                        	popq	%r12
   2fa08: 41 5d                        	popq	%r13
   2fa0a: 41 5e                        	popq	%r14
   2fa0c: 41 5f                        	popq	%r15
   2fa0e: 5d                           	popq	%rbp
   2fa0f: c3                           	retq
