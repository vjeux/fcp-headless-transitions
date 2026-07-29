
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

000000000002fa86 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime>:
   2fa86: 55                           	pushq	%rbp
   2fa87: 48 89 e5                     	movq	%rsp, %rbp
   2fa8a: 41 57                        	pushq	%r15
   2fa8c: 41 56                        	pushq	%r14
   2fa8e: 41 55                        	pushq	%r13
   2fa90: 41 54                        	pushq	%r12
   2fa92: 53                           	pushq	%rbx
   2fa93: 48 83 ec 58                  	subq	$0x58, %rsp
   2fa97: 49 89 cf                     	movq	%rcx, %r15
   2fa9a: 49 89 f6                     	movq	%rsi, %r14
   2fa9d: 49 89 fc                     	movq	%rdi, %r12
   2faa0: 48 85 d2                     	testq	%rdx, %rdx
   2faa3: 74 07                        	je	0x2faac <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x26>
   2faa5: 48 c7 02 00 00 00 00         	movq	$0x0, (%rdx)
   2faac: 4d 8b 2e                     	movq	(%r14), %r13
   2faaf: 49 8b 44 24 28               	movq	0x28(%r12), %rax
   2fab4: 49 39 c5                     	cmpq	%rax, %r13
   2fab7: 0f 84 be 01 00 00            	je	0x2fc7b <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x1f5>
   2fabd: 48 89 55 d0                  	movq	%rdx, -0x30(%rbp)
   2fac1: 41 80 7c 24 70 01            	cmpb	$0x1, 0x70(%r12)
   2fac7: 75 2d                        	jne	0x2faf6 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x70>
   2fac9: 49 8b 75 00                  	movq	(%r13), %rsi
   2facd: 4c 89 e7                     	movq	%r12, %rdi
   2fad0: e8 d7 02 00 00               	callq	0x2fdac <__ZN8OZSpline18getValidVertexIterEPv>
   2fad5: 49 3b 44 24 48               	cmpq	0x48(%r12), %rax
   2fada: 0f 84 8c 01 00 00            	je	0x2fc6c <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x1e6>
   2fae0: 48 8b 55 d0                  	movq	-0x30(%rbp), %rdx
   2fae4: 48 85 d2                     	testq	%rdx, %rdx
   2fae7: 0f 84 a2 01 00 00            	je	0x2fc8f <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x209>
   2faed: 48 8b 58 f8                  	movq	-0x8(%rax), %rbx
   2faf1: e9 72 01 00 00               	jmp	0x2fc68 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x1e2>
   2faf6: 48 8b 0d b3 a9 09 00         	movq	0x9a9b3(%rip), %rcx     ## 0xca4b0 <_tan+0xca4b0>
   2fafd: 48 8b 51 10                  	movq	0x10(%rcx), %rdx
   2fb01: 48 89 55 c0                  	movq	%rdx, -0x40(%rbp)
   2fb05: 0f 10 01                     	movups	(%rcx), %xmm0
   2fb08: 0f 29 45 b0                  	movaps	%xmm0, -0x50(%rbp)
   2fb0c: 49 83 c5 f8                  	addq	$-0x8, %r13
   2fb10: 31 db                        	xorl	%ebx, %ebx
   2fb12: 49 39 c5                     	cmpq	%rax, %r13
   2fb15: 0f 84 a6 00 00 00            	je	0x2fbc1 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x13b>
   2fb1b: 48 85 db                     	testq	%rbx, %rbx
   2fb1e: 74 34                        	je	0x2fb54 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0xce>
   2fb20: 49 8b 45 00                  	movq	(%r13), %rax
   2fb24: 48 8b 4d c0                  	movq	-0x40(%rbp), %rcx
   2fb28: 48 89 4c 24 28               	movq	%rcx, 0x28(%rsp)
   2fb2d: 0f 28 45 b0                  	movaps	-0x50(%rbp), %xmm0
   2fb31: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   2fb36: 48 8b 48 20                  	movq	0x20(%rax), %rcx
   2fb3a: 48 89 4c 24 10               	movq	%rcx, 0x10(%rsp)
   2fb3f: 0f 10 40 10                  	movups	0x10(%rax), %xmm0
   2fb43: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   2fb47: e8 34 cf 07 00               	callq	0xaca80 <_tan+0xaca80>
   2fb4c: 85 c0                        	testl	%eax, %eax
   2fb4e: 0f 85 2b 01 00 00            	jne	0x2fc7f <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x1f9>
   2fb54: 49 8b 7d 00                  	movq	(%r13), %rdi
   2fb58: 48 8b 07                     	movq	(%rdi), %rax
   2fb5b: 4c 89 fe                     	movq	%r15, %rsi
   2fb5e: ff 90 88 00 00 00            	callq	*0x88(%rax)
   2fb64: 84 c0                        	testb	%al, %al
   2fb66: 74 4a                        	je	0x2fbb2 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x12c>
   2fb68: 49 8b 45 00                  	movq	(%r13), %rax
   2fb6c: 49 8b 0e                     	movq	(%r14), %rcx
   2fb6f: 48 8b 09                     	movq	(%rcx), %rcx
   2fb72: 48 8b 51 20                  	movq	0x20(%rcx), %rdx
   2fb76: 48 89 54 24 28               	movq	%rdx, 0x28(%rsp)
   2fb7b: 0f 10 41 10                  	movups	0x10(%rcx), %xmm0
   2fb7f: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   2fb84: 48 8b 48 20                  	movq	0x20(%rax), %rcx
   2fb88: 48 89 4c 24 10               	movq	%rcx, 0x10(%rsp)
   2fb8d: 0f 10 40 10                  	movups	0x10(%rax), %xmm0
   2fb91: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   2fb95: e8 e6 ce 07 00               	callq	0xaca80 <_tan+0xaca80>
   2fb9a: 85 c0                        	testl	%eax, %eax
   2fb9c: 74 14                        	je	0x2fbb2 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x12c>
   2fb9e: 49 8b 5d 00                  	movq	(%r13), %rbx
   2fba2: 48 8b 43 20                  	movq	0x20(%rbx), %rax
   2fba6: 48 89 45 c0                  	movq	%rax, -0x40(%rbp)
   2fbaa: 0f 10 43 10                  	movups	0x10(%rbx), %xmm0
   2fbae: 0f 29 45 b0                  	movaps	%xmm0, -0x50(%rbp)
   2fbb2: 49 83 c5 f8                  	addq	$-0x8, %r13
   2fbb6: 4d 3b 6c 24 28               	cmpq	0x28(%r12), %r13
   2fbbb: 0f 85 5a ff ff ff            	jne	0x2fb1b <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x95>
   2fbc1: 48 8b 45 d0                  	movq	-0x30(%rbp), %rax
   2fbc5: 48 85 c0                     	testq	%rax, %rax
   2fbc8: 74 03                        	je	0x2fbcd <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x147>
   2fbca: 48 89 18                     	movq	%rbx, (%rax)
   2fbcd: 48 85 db                     	testq	%rbx, %rbx
   2fbd0: 74 38                        	je	0x2fc0a <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x184>
   2fbd2: 49 8b 45 00                  	movq	(%r13), %rax
   2fbd6: 48 8b 4d c0                  	movq	-0x40(%rbp), %rcx
   2fbda: 48 89 4c 24 28               	movq	%rcx, 0x28(%rsp)
   2fbdf: 0f 28 45 b0                  	movaps	-0x50(%rbp), %xmm0
   2fbe3: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   2fbe8: 48 8b 48 20                  	movq	0x20(%rax), %rcx
   2fbec: 48 89 4c 24 10               	movq	%rcx, 0x10(%rsp)
   2fbf1: 0f 10 40 10                  	movups	0x10(%rax), %xmm0
   2fbf5: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   2fbf9: e8 82 ce 07 00               	callq	0xaca80 <_tan+0xaca80>
   2fbfe: 89 c1                        	movl	%eax, %ecx
   2fc00: b0 01                        	movb	$0x1, %al
   2fc02: 85 c9                        	testl	%ecx, %ecx
   2fc04: 0f 85 87 00 00 00            	jne	0x2fc91 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x20b>
   2fc0a: 49 8b 7d 00                  	movq	(%r13), %rdi
   2fc0e: 48 8b 07                     	movq	(%rdi), %rax
   2fc11: 4c 89 fe                     	movq	%r15, %rsi
   2fc14: ff 90 88 00 00 00            	callq	*0x88(%rax)
   2fc1a: 84 c0                        	testb	%al, %al
   2fc1c: 74 5d                        	je	0x2fc7b <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x1f5>
   2fc1e: 49 8b 45 00                  	movq	(%r13), %rax
   2fc22: 49 8b 0e                     	movq	(%r14), %rcx
   2fc25: 48 8b 09                     	movq	(%rcx), %rcx
   2fc28: 48 8b 51 20                  	movq	0x20(%rcx), %rdx
   2fc2c: 48 89 54 24 28               	movq	%rdx, 0x28(%rsp)
   2fc31: 0f 10 41 10                  	movups	0x10(%rcx), %xmm0
   2fc35: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   2fc3a: 48 8b 48 20                  	movq	0x20(%rax), %rcx
   2fc3e: 48 89 4c 24 10               	movq	%rcx, 0x10(%rsp)
   2fc43: 0f 10 40 10                  	movups	0x10(%rax), %xmm0
   2fc47: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   2fc4b: e8 30 ce 07 00               	callq	0xaca80 <_tan+0xaca80>
   2fc50: 89 c1                        	movl	%eax, %ecx
   2fc52: 85 c0                        	testl	%eax, %eax
   2fc54: 0f 95 c0                     	setne	%al
   2fc57: 48 8b 55 d0                  	movq	-0x30(%rbp), %rdx
   2fc5b: 48 85 d2                     	testq	%rdx, %rdx
   2fc5e: 74 31                        	je	0x2fc91 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x20b>
   2fc60: 85 c9                        	testl	%ecx, %ecx
   2fc62: 74 2d                        	je	0x2fc91 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x20b>
   2fc64: 49 8b 5d 00                  	movq	(%r13), %rbx
   2fc68: b0 01                        	movb	$0x1, %al
   2fc6a: eb 1e                        	jmp	0x2fc8a <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x204>
   2fc6c: 31 c0                        	xorl	%eax, %eax
   2fc6e: 48 8b 55 d0                  	movq	-0x30(%rbp), %rdx
   2fc72: 48 85 d2                     	testq	%rdx, %rdx
   2fc75: 74 04                        	je	0x2fc7b <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x1f5>
   2fc77: 31 db                        	xorl	%ebx, %ebx
   2fc79: eb 0f                        	jmp	0x2fc8a <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x204>
   2fc7b: 31 c0                        	xorl	%eax, %eax
   2fc7d: eb 12                        	jmp	0x2fc91 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x20b>
   2fc7f: b0 01                        	movb	$0x1, %al
   2fc81: 48 8b 55 d0                  	movq	-0x30(%rbp), %rdx
   2fc85: 48 85 d2                     	testq	%rdx, %rdx
   2fc88: 74 07                        	je	0x2fc91 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x20b>
   2fc8a: 48 89 1a                     	movq	%rbx, (%rdx)
   2fc8d: eb 02                        	jmp	0x2fc91 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x20b>
   2fc8f: b0 01                        	movb	$0x1, %al
   2fc91: 48 83 c4 58                  	addq	$0x58, %rsp
   2fc95: 5b                           	popq	%rbx
   2fc96: 41 5c                        	popq	%r12
   2fc98: 41 5d                        	popq	%r13
   2fc9a: 41 5e                        	popq	%r14
   2fc9c: 41 5f                        	popq	%r15
   2fc9e: 5d                           	popq	%rbp
   2fc9f: c3                           	retq
