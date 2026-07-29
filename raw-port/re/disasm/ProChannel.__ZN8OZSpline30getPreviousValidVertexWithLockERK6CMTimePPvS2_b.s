
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

000000000002fd26 <__ZN8OZSpline30getPreviousValidVertexWithLockERK6CMTimePPvS2_b>:
   2fd26: 55                           	pushq	%rbp
   2fd27: 48 89 e5                     	movq	%rsp, %rbp
   2fd2a: 41 57                        	pushq	%r15
   2fd2c: 41 56                        	pushq	%r14
   2fd2e: 41 55                        	pushq	%r13
   2fd30: 41 54                        	pushq	%r12
   2fd32: 53                           	pushq	%rbx
   2fd33: 50                           	pushq	%rax
   2fd34: 45 89 c4                     	movl	%r8d, %r12d
   2fd37: 49 89 ce                     	movq	%rcx, %r14
   2fd3a: 49 89 d7                     	movq	%rdx, %r15
   2fd3d: 49 89 f5                     	movq	%rsi, %r13
   2fd40: 48 89 fb                     	movq	%rdi, %rbx
   2fd43: 48 8b 87 a0 00 00 00         	movq	0xa0(%rdi), %rax
   2fd4a: 48 85 c0                     	testq	%rax, %rax
   2fd4d: 74 09                        	je	0x2fd58 <__ZN8OZSpline30getPreviousValidVertexWithLockERK6CMTimePPvS2_b+0x32>
   2fd4f: 48 8b 78 30                  	movq	0x30(%rax), %rdi
   2fd53: 48 85 ff                     	testq	%rdi, %rdi
   2fd56: 75 04                        	jne	0x2fd5c <__ZN8OZSpline30getPreviousValidVertexWithLockERK6CMTimePPvS2_b+0x36>
   2fd58: 48 8d 7b 08                  	leaq	0x8(%rbx), %rdi
   2fd5c: e8 b5 cd 07 00               	callq	0xacb16 <_tan+0xacb16>
   2fd61: 45 0f b6 c4                  	movzbl	%r12b, %r8d
   2fd65: 48 89 df                     	movq	%rbx, %rdi
   2fd68: 4c 89 ee                     	movq	%r13, %rsi
   2fd6b: 4c 89 fa                     	movq	%r15, %rdx
   2fd6e: 4c 89 f1                     	movq	%r14, %rcx
   2fd71: e8 d6 eb ff ff               	callq	0x2e94c <__ZN8OZSpline22getPreviousValidVertexERK6CMTimePPvS2_b>
   2fd76: 41 89 c6                     	movl	%eax, %r14d
   2fd79: 48 8b 83 a0 00 00 00         	movq	0xa0(%rbx), %rax
   2fd80: 48 85 c0                     	testq	%rax, %rax
   2fd83: 74 09                        	je	0x2fd8e <__ZN8OZSpline30getPreviousValidVertexWithLockERK6CMTimePPvS2_b+0x68>
   2fd85: 48 8b 78 30                  	movq	0x30(%rax), %rdi
   2fd89: 48 85 ff                     	testq	%rdi, %rdi
   2fd8c: 75 07                        	jne	0x2fd95 <__ZN8OZSpline30getPreviousValidVertexWithLockERK6CMTimePPvS2_b+0x6f>
   2fd8e: 48 83 c3 08                  	addq	$0x8, %rbx
   2fd92: 48 89 df                     	movq	%rbx, %rdi
   2fd95: e8 82 cd 07 00               	callq	0xacb1c <_tan+0xacb1c>
   2fd9a: 44 89 f0                     	movl	%r14d, %eax
   2fd9d: 48 83 c4 08                  	addq	$0x8, %rsp
   2fda1: 5b                           	popq	%rbx
   2fda2: 41 5c                        	popq	%r12
   2fda4: 41 5d                        	popq	%r13
   2fda6: 41 5e                        	popq	%r14
   2fda8: 41 5f                        	popq	%r15
   2fdaa: 5d                           	popq	%rbp
   2fdab: c3                           	retq
