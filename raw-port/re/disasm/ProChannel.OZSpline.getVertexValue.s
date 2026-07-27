
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000303a6 <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b>:
   303a6: 55                           	pushq	%rbp
   303a7: 48 89 e5                     	movq	%rsp, %rbp
   303aa: 41 57                        	pushq	%r15
   303ac: 41 56                        	pushq	%r14
   303ae: 41 55                        	pushq	%r13
   303b0: 41 54                        	pushq	%r12
   303b2: 53                           	pushq	%rbx
   303b3: 48 81 ec b8 00 00 00         	subq	$0xb8, %rsp
   303ba: 41 89 ce                     	movl	%ecx, %r14d
   303bd: 49 89 d7                     	movq	%rdx, %r15
   303c0: 49 89 f4                     	movq	%rsi, %r12
   303c3: 48 89 fb                     	movq	%rdi, %rbx
   303c6: 31 c0                        	xorl	%eax, %eax
   303c8: 48 89 45 98                  	movq	%rax, -0x68(%rbp)
   303cc: 48 89 45 a8                  	movq	%rax, -0x58(%rbp)
   303d0: 48 89 45 88                  	movq	%rax, -0x78(%rbp)
   303d4: 48 8b bf a0 00 00 00         	movq	0xa0(%rdi), %rdi
   303db: 48 85 ff                     	testq	%rdi, %rdi
   303de: 74 08                        	je	0x303e8 <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x42>
   303e0: 48 8b 07                     	movq	(%rdi), %rax
   303e3: ff 50 48                     	callq	*0x48(%rax)
   303e6: eb 03                        	jmp	0x303eb <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x45>
   303e8: 0f 57 c0                     	xorps	%xmm0, %xmm0
   303eb: f2 0f 11 45 d0               	movsd	%xmm0, -0x30(%rbp)
   303f0: 45 84 f6                     	testb	%r14b, %r14b
   303f3: 74 1e                        	je	0x30413 <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x6d>
   303f5: 48 8b 83 a0 00 00 00         	movq	0xa0(%rbx), %rax
   303fc: 48 85 c0                     	testq	%rax, %rax
   303ff: 74 09                        	je	0x3040a <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x64>
   30401: 48 8b 78 30                  	movq	0x30(%rax), %rdi
   30405: 48 85 ff                     	testq	%rdi, %rdi
   30408: 75 04                        	jne	0x3040e <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x68>
   3040a: 48 8d 7b 08                  	leaq	0x8(%rbx), %rdi
   3040e: e8 03 c7 07 00               	callq	0xacb16 <_tan+0xacb16>
   30413: 48 8b bb 98 00 00 00         	movq	0x98(%rbx), %rdi
   3041a: 48 8b 83 a8 00 00 00         	movq	0xa8(%rbx), %rax
   30421: 8b 70 20                     	movl	0x20(%rax), %esi
   30424: e8 7d 43 01 00               	callq	0x447a6 <__ZN15OZInterpolators15getInterpolatorEj>
   30429: 48 8b 08                     	movq	(%rax), %rcx
   3042c: 48 89 c7                     	movq	%rax, %rdi
   3042f: ff 51 40                     	callq	*0x40(%rcx)
   30432: 84 c0                        	testb	%al, %al
   30434: 4c 89 7d c8                  	movq	%r15, -0x38(%rbp)
   30438: 0f 84 02 01 00 00            	je	0x30540 <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x19a>
   3043e: 48 8b 15 7b a0 09 00         	movq	0x9a07b(%rip), %rdx     ## 0xca4c0 <_tan+0xca4c0>
   30445: 4c 8d ad 58 ff ff ff         	leaq	-0xa8(%rbp), %r13
   3044c: 4c 89 ef                     	movq	%r13, %rdi
   3044f: 48 89 de                     	movq	%rbx, %rsi
   30452: 31 c9                        	xorl	%ecx, %ecx
   30454: e8 25 d7 ff ff               	callq	0x2db7e <__ZN8OZSpline12getMinValueUERK6CMTimeb>
   30459: 49 8b 44 24 10               	movq	0x10(%r12), %rax
   3045e: 48 89 45 c0                  	movq	%rax, -0x40(%rbp)
   30462: 41 0f 10 04 24               	movups	(%r12), %xmm0
   30467: 0f 29 45 b0                  	movaps	%xmm0, -0x50(%rbp)
   3046b: 49 8b 45 10                  	movq	0x10(%r13), %rax
   3046f: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   30474: 41 0f 10 45 00               	movups	(%r13), %xmm0
   30479: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   3047e: 48 8b 45 c0                  	movq	-0x40(%rbp), %rax
   30482: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   30487: 0f 28 45 b0                  	movaps	-0x50(%rbp), %xmm0
   3048b: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   3048f: e8 ec c5 07 00               	callq	0xaca80 <_tan+0xaca80>
   30494: 85 c0                        	testl	%eax, %eax
   30496: 79 0d                        	jns	0x304a5 <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0xff>
   30498: 80 bb 90 00 00 00 00         	cmpb	$0x0, 0x90(%rbx)
   3049f: 0f 84 24 04 00 00            	je	0x308c9 <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x523>
   304a5: 48 8b 15 14 a0 09 00         	movq	0x9a014(%rip), %rdx     ## 0xca4c0 <_tan+0xca4c0>
   304ac: 4c 89 ef                     	movq	%r13, %rdi
   304af: 48 89 de                     	movq	%rbx, %rsi
   304b2: 31 c9                        	xorl	%ecx, %ecx
   304b4: e8 8b d5 ff ff               	callq	0x2da44 <__ZN8OZSpline12getMaxValueUERK6CMTimeb>
   304b9: 49 8b 44 24 10               	movq	0x10(%r12), %rax
   304be: 48 89 45 c0                  	movq	%rax, -0x40(%rbp)
   304c2: 41 0f 10 04 24               	movups	(%r12), %xmm0
   304c7: 0f 29 45 b0                  	movaps	%xmm0, -0x50(%rbp)
   304cb: 49 8b 45 10                  	movq	0x10(%r13), %rax
   304cf: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   304d4: 41 0f 10 45 00               	movups	(%r13), %xmm0
   304d9: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   304de: 48 8b 45 c0                  	movq	-0x40(%rbp), %rax
   304e2: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   304e7: 0f 28 45 b0                  	movaps	-0x50(%rbp), %xmm0
   304eb: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   304ef: e8 8c c5 07 00               	callq	0xaca80 <_tan+0xaca80>
   304f4: 85 c0                        	testl	%eax, %eax
   304f6: 0f 8e cf 00 00 00            	jle	0x305cb <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x225>
   304fc: 41 b5 01                     	movb	$0x1, %r13b
   304ff: 80 bb 90 00 00 00 00         	cmpb	$0x0, 0x90(%rbx)
   30506: 0f 85 17 01 00 00            	jne	0x30623 <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x27d>
   3050c: 48 8d 75 a8                  	leaq	-0x58(%rbp), %rsi
   30510: 48 89 df                     	movq	%rbx, %rdi
   30513: 4c 8b 7d c8                  	movq	-0x38(%rbp), %r15
   30517: 4c 89 fa                     	movq	%r15, %rdx
   3051a: e8 3b d8 ff ff               	callq	0x2dd5a <__ZN8OZSpline18getLastValidVertexEPPvRK6CMTime>
   3051f: 84 c0                        	testb	%al, %al
   30521: 0f 84 41 04 00 00            	je	0x30968 <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x5c2>
   30527: 48 8b 75 a8                  	movq	-0x58(%rbp), %rsi
   3052b: 4c 8d 45 d0                  	leaq	-0x30(%rbp), %r8
   3052f: 48 89 df                     	movq	%rbx, %rdi
   30532: 4c 89 fa                     	movq	%r15, %rdx
   30535: 4c 89 e1                     	movq	%r12, %rcx
   30538: 45 31 c9                     	xorl	%r9d, %r9d
   3053b: e9 bb 03 00 00               	jmp	0x308fb <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x555>
   30540: 48 c7 85 58 ff ff ff 00 00 00 00     	movq	$0x0, -0xa8(%rbp)
   3054b: c7 85 70 ff ff ff 01 00 00 00	movl	$0x1, -0x90(%rbp)
   30555: 45 84 f6                     	testb	%r14b, %r14b
   30558: 74 1e                        	je	0x30578 <__ZN8OZSpline14getVertexValueERK6CMTimeS2_b+0x1d2>
   3055a: 48 8b 83 a0 00 00 00         	movq	0xa0(%rbx), %rax
