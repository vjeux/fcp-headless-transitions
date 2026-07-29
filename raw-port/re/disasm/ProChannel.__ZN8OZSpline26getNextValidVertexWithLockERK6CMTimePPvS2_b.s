
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

000000000002fca0 <__ZN8OZSpline26getNextValidVertexWithLockERK6CMTimePPvS2_b>:
   2fca0: 55                           	pushq	%rbp
   2fca1: 48 89 e5                     	movq	%rsp, %rbp
   2fca4: 41 57                        	pushq	%r15
   2fca6: 41 56                        	pushq	%r14
   2fca8: 41 55                        	pushq	%r13
   2fcaa: 41 54                        	pushq	%r12
   2fcac: 53                           	pushq	%rbx
   2fcad: 50                           	pushq	%rax
   2fcae: 45 89 c4                     	movl	%r8d, %r12d
   2fcb1: 49 89 ce                     	movq	%rcx, %r14
   2fcb4: 49 89 d7                     	movq	%rdx, %r15
   2fcb7: 49 89 f5                     	movq	%rsi, %r13
   2fcba: 48 89 fb                     	movq	%rdi, %rbx
   2fcbd: 48 8b 87 a0 00 00 00         	movq	0xa0(%rdi), %rax
   2fcc4: 48 85 c0                     	testq	%rax, %rax
   2fcc7: 74 09                        	je	0x2fcd2 <__ZN8OZSpline26getNextValidVertexWithLockERK6CMTimePPvS2_b+0x32>
   2fcc9: 48 8b 78 30                  	movq	0x30(%rax), %rdi
   2fccd: 48 85 ff                     	testq	%rdi, %rdi
   2fcd0: 75 04                        	jne	0x2fcd6 <__ZN8OZSpline26getNextValidVertexWithLockERK6CMTimePPvS2_b+0x36>
   2fcd2: 48 8d 7b 08                  	leaq	0x8(%rbx), %rdi
   2fcd6: e8 3b ce 07 00               	callq	0xacb16 <_tan+0xacb16>
   2fcdb: 45 0f b6 c4                  	movzbl	%r12b, %r8d
   2fcdf: 48 89 df                     	movq	%rbx, %rdi
   2fce2: 4c 89 ee                     	movq	%r13, %rsi
   2fce5: 4c 89 fa                     	movq	%r15, %rdx
   2fce8: 4c 89 f1                     	movq	%r14, %rcx
   2fceb: e8 86 ee ff ff               	callq	0x2eb76 <__ZN8OZSpline18getNextValidVertexERK6CMTimePPvS2_b>
   2fcf0: 41 89 c6                     	movl	%eax, %r14d
   2fcf3: 48 8b 83 a0 00 00 00         	movq	0xa0(%rbx), %rax
   2fcfa: 48 85 c0                     	testq	%rax, %rax
   2fcfd: 74 09                        	je	0x2fd08 <__ZN8OZSpline26getNextValidVertexWithLockERK6CMTimePPvS2_b+0x68>
   2fcff: 48 8b 78 30                  	movq	0x30(%rax), %rdi
   2fd03: 48 85 ff                     	testq	%rdi, %rdi
   2fd06: 75 07                        	jne	0x2fd0f <__ZN8OZSpline26getNextValidVertexWithLockERK6CMTimePPvS2_b+0x6f>
   2fd08: 48 83 c3 08                  	addq	$0x8, %rbx
   2fd0c: 48 89 df                     	movq	%rbx, %rdi
   2fd0f: e8 08 ce 07 00               	callq	0xacb1c <_tan+0xacb1c>
   2fd14: 44 89 f0                     	movl	%r14d, %eax
   2fd17: 48 83 c4 08                  	addq	$0x8, %rsp
   2fd1b: 5b                           	popq	%rbx
   2fd1c: 41 5c                        	popq	%r12
   2fd1e: 41 5d                        	popq	%r13
   2fd20: 41 5e                        	popq	%r14
   2fd22: 41 5f                        	popq	%r15
   2fd24: 5d                           	popq	%rbp
   2fd25: c3                           	retq
