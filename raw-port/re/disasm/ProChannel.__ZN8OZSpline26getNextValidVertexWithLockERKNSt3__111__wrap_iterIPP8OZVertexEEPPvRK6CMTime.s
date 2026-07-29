
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

000000000002f89a <__ZN8OZSpline26getNextValidVertexWithLockERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime>:
   2f89a: 55                           	pushq	%rbp
   2f89b: 48 89 e5                     	movq	%rsp, %rbp
   2f89e: 41 57                        	pushq	%r15
   2f8a0: 41 56                        	pushq	%r14
   2f8a2: 41 54                        	pushq	%r12
   2f8a4: 53                           	pushq	%rbx
   2f8a5: 49 89 ce                     	movq	%rcx, %r14
   2f8a8: 49 89 d7                     	movq	%rdx, %r15
   2f8ab: 49 89 f4                     	movq	%rsi, %r12
   2f8ae: 48 89 fb                     	movq	%rdi, %rbx
   2f8b1: 48 8b 87 a0 00 00 00         	movq	0xa0(%rdi), %rax
   2f8b8: 48 85 c0                     	testq	%rax, %rax
   2f8bb: 74 09                        	je	0x2f8c6 <__ZN8OZSpline26getNextValidVertexWithLockERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x2c>
   2f8bd: 48 8b 78 30                  	movq	0x30(%rax), %rdi
   2f8c1: 48 85 ff                     	testq	%rdi, %rdi
   2f8c4: 75 04                        	jne	0x2f8ca <__ZN8OZSpline26getNextValidVertexWithLockERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x30>
   2f8c6: 48 8d 7b 08                  	leaq	0x8(%rbx), %rdi
   2f8ca: e8 47 d2 07 00               	callq	0xacb16 <_tan+0xacb16>
   2f8cf: 48 89 df                     	movq	%rbx, %rdi
   2f8d2: 4c 89 e6                     	movq	%r12, %rsi
   2f8d5: 4c 89 fa                     	movq	%r15, %rdx
   2f8d8: 4c 89 f1                     	movq	%r14, %rcx
   2f8db: e8 30 00 00 00               	callq	0x2f910 <__ZN8OZSpline18getNextValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime>
   2f8e0: 41 89 c6                     	movl	%eax, %r14d
   2f8e3: 48 8b 83 a0 00 00 00         	movq	0xa0(%rbx), %rax
   2f8ea: 48 85 c0                     	testq	%rax, %rax
   2f8ed: 74 09                        	je	0x2f8f8 <__ZN8OZSpline26getNextValidVertexWithLockERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x5e>
   2f8ef: 48 8b 78 30                  	movq	0x30(%rax), %rdi
   2f8f3: 48 85 ff                     	testq	%rdi, %rdi
   2f8f6: 75 07                        	jne	0x2f8ff <__ZN8OZSpline26getNextValidVertexWithLockERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x65>
   2f8f8: 48 83 c3 08                  	addq	$0x8, %rbx
   2f8fc: 48 89 df                     	movq	%rbx, %rdi
   2f8ff: e8 18 d2 07 00               	callq	0xacb1c <_tan+0xacb1c>
   2f904: 44 89 f0                     	movl	%r14d, %eax
   2f907: 5b                           	popq	%rbx
   2f908: 41 5c                        	popq	%r12
   2f90a: 41 5e                        	popq	%r14
   2f90c: 41 5f                        	popq	%r15
   2f90e: 5d                           	popq	%rbp
   2f90f: c3                           	retq
