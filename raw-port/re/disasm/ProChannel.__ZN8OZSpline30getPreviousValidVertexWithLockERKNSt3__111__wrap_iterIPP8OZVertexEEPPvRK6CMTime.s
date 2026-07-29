
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

000000000002fa10 <__ZN8OZSpline30getPreviousValidVertexWithLockERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime>:
   2fa10: 55                           	pushq	%rbp
   2fa11: 48 89 e5                     	movq	%rsp, %rbp
   2fa14: 41 57                        	pushq	%r15
   2fa16: 41 56                        	pushq	%r14
   2fa18: 41 54                        	pushq	%r12
   2fa1a: 53                           	pushq	%rbx
   2fa1b: 49 89 ce                     	movq	%rcx, %r14
   2fa1e: 49 89 d7                     	movq	%rdx, %r15
   2fa21: 49 89 f4                     	movq	%rsi, %r12
   2fa24: 48 89 fb                     	movq	%rdi, %rbx
   2fa27: 48 8b 87 a0 00 00 00         	movq	0xa0(%rdi), %rax
   2fa2e: 48 85 c0                     	testq	%rax, %rax
   2fa31: 74 09                        	je	0x2fa3c <__ZN8OZSpline30getPreviousValidVertexWithLockERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x2c>
   2fa33: 48 8b 78 30                  	movq	0x30(%rax), %rdi
   2fa37: 48 85 ff                     	testq	%rdi, %rdi
   2fa3a: 75 04                        	jne	0x2fa40 <__ZN8OZSpline30getPreviousValidVertexWithLockERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x30>
   2fa3c: 48 8d 7b 08                  	leaq	0x8(%rbx), %rdi
   2fa40: e8 d1 d0 07 00               	callq	0xacb16 <_tan+0xacb16>
   2fa45: 48 89 df                     	movq	%rbx, %rdi
   2fa48: 4c 89 e6                     	movq	%r12, %rsi
   2fa4b: 4c 89 fa                     	movq	%r15, %rdx
   2fa4e: 4c 89 f1                     	movq	%r14, %rcx
   2fa51: e8 30 00 00 00               	callq	0x2fa86 <__ZN8OZSpline22getPreviousValidVertexERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime>
   2fa56: 41 89 c6                     	movl	%eax, %r14d
   2fa59: 48 8b 83 a0 00 00 00         	movq	0xa0(%rbx), %rax
   2fa60: 48 85 c0                     	testq	%rax, %rax
   2fa63: 74 09                        	je	0x2fa6e <__ZN8OZSpline30getPreviousValidVertexWithLockERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x5e>
   2fa65: 48 8b 78 30                  	movq	0x30(%rax), %rdi
   2fa69: 48 85 ff                     	testq	%rdi, %rdi
   2fa6c: 75 07                        	jne	0x2fa75 <__ZN8OZSpline30getPreviousValidVertexWithLockERKNSt3__111__wrap_iterIPP8OZVertexEEPPvRK6CMTime+0x65>
   2fa6e: 48 83 c3 08                  	addq	$0x8, %rbx
   2fa72: 48 89 df                     	movq	%rbx, %rdi
   2fa75: e8 a2 d0 07 00               	callq	0xacb1c <_tan+0xacb1c>
   2fa7a: 44 89 f0                     	movl	%r14d, %eax
   2fa7d: 5b                           	popq	%rbx
   2fa7e: 41 5c                        	popq	%r12
   2fa80: 41 5e                        	popq	%r14
   2fa82: 41 5f                        	popq	%r15
   2fa84: 5d                           	popq	%rbp
   2fa85: c3                           	retq
