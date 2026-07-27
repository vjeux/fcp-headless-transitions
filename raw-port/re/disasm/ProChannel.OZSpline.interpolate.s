
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

0000000000031ec8 <__ZN8OZSpline11interpolateERK6CMTimePvS3_S2_Pdb>:
   31ec8: 55                           	pushq	%rbp
   31ec9: 48 89 e5                     	movq	%rsp, %rbp
   31ecc: 41 57                        	pushq	%r15
   31ece: 41 56                        	pushq	%r14
   31ed0: 41 55                        	pushq	%r13
   31ed2: 41 54                        	pushq	%r12
   31ed4: 53                           	pushq	%rbx
   31ed5: 48 83 ec 18                  	subq	$0x18, %rsp
   31ed9: 4c 89 4d c8                  	movq	%r9, -0x38(%rbp)
   31edd: 4c 89 45 d0                  	movq	%r8, -0x30(%rbp)
   31ee1: 49 89 cf                     	movq	%rcx, %r15
   31ee4: 49 89 d4                     	movq	%rdx, %r12
   31ee7: 49 89 f5                     	movq	%rsi, %r13
   31eea: 48 89 fb                     	movq	%rdi, %rbx
   31eed: 48 8b 87 a0 00 00 00         	movq	0xa0(%rdi), %rax
   31ef4: 48 85 c0                     	testq	%rax, %rax
   31ef7: 74 1c                        	je	0x31f15 <__ZN8OZSpline11interpolateERK6CMTimePvS3_S2_Pdb+0x4d>
   31ef9: 4c 8b 70 28                  	movq	0x28(%rax), %r14
   31efd: 4d 85 f6                     	testq	%r14, %r14
   31f00: 74 13                        	je	0x31f15 <__ZN8OZSpline11interpolateERK6CMTimePvS3_S2_Pdb+0x4d>
   31f02: 49 8b 06                     	movq	(%r14), %rax
   31f05: 4c 89 f7                     	movq	%r14, %rdi
   31f08: 48 89 de                     	movq	%rbx, %rsi
   31f0b: 4c 89 e2                     	movq	%r12, %rdx
   31f0e: ff 50 70                     	callq	*0x70(%rax)
   31f11: 84 c0                        	testb	%al, %al
   31f13: 75 3d                        	jne	0x31f52 <__ZN8OZSpline11interpolateERK6CMTimePvS3_S2_Pdb+0x8a>
   31f15: 49 8b 04 24                  	movq	(%r12), %rax
   31f19: 4c 89 e7                     	movq	%r12, %rdi
   31f1c: ff 90 d0 00 00 00            	callq	*0xd0(%rax)
   31f22: 48 8b bb 98 00 00 00         	movq	0x98(%rbx), %rdi
   31f29: 89 c6                        	movl	%eax, %esi
   31f2b: e8 76 28 01 00               	callq	0x447a6 <__ZN15OZInterpolators15getInterpolatorEj>
   31f30: 49 89 c6                     	movq	%rax, %r14
   31f33: 48 8b 00                     	movq	(%rax), %rax
   31f36: 4c 89 f7                     	movq	%r14, %rdi
   31f39: 48 89 de                     	movq	%rbx, %rsi
   31f3c: ff 50 58                     	callq	*0x58(%rax)
   31f3f: 84 c0                        	testb	%al, %al
   31f41: 74 0f                        	je	0x31f52 <__ZN8OZSpline11interpolateERK6CMTimePvS3_S2_Pdb+0x8a>
   31f43: 49 8b 06                     	movq	(%r14), %rax
   31f46: 4c 89 f7                     	movq	%r14, %rdi
   31f49: 48 89 de                     	movq	%rbx, %rsi
   31f4c: 4c 89 ea                     	movq	%r13, %rdx
   31f4f: ff 50 10                     	callq	*0x10(%rax)
   31f52: 48 8b 83 a8 00 00 00         	movq	0xa8(%rbx), %rax
   31f59: 0f b6 00                     	movzbl	(%rax), %eax
   31f5c: 4d 8b 16                     	movq	(%r14), %r10
   31f5f: 44 0f b6 5d 10               	movzbl	0x10(%rbp), %r11d
   31f64: 4c 89 f7                     	movq	%r14, %rdi
   31f67: 48 89 de                     	movq	%rbx, %rsi
   31f6a: 4c 89 ea                     	movq	%r13, %rdx
   31f6d: 4c 89 e1                     	movq	%r12, %rcx
   31f70: 4d 89 f8                     	movq	%r15, %r8
   31f73: 4c 8b 4d d0                  	movq	-0x30(%rbp), %r9
   31f77: 41 53                        	pushq	%r11
   31f79: 50                           	pushq	%rax
   31f7a: 41 ff 52 18                  	callq	*0x18(%r10)
   31f7e: 48 83 c4 10                  	addq	$0x10, %rsp
   31f82: 48 8b 45 c8                  	movq	-0x38(%rbp), %rax
   31f86: f2 0f 11 00                  	movsd	%xmm0, (%rax)
   31f8a: 48 83 c4 18                  	addq	$0x18, %rsp
   31f8e: 5b                           	popq	%rbx
   31f8f: 41 5c                        	popq	%r12
   31f91: 41 5d                        	popq	%r13
   31f93: 41 5e                        	popq	%r14
   31f95: 41 5f                        	popq	%r15
   31f97: 5d                           	popq	%rbp
   31f98: c3                           	retq
   31f99: 90                           	nop
