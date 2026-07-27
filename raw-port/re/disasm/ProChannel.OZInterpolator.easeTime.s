
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000418b2 <__ZN14OZInterpolator8easeTimeER8OZSplineRK6CMTimePvS5_>:
   418b2: 55                           	pushq	%rbp
   418b3: 48 89 e5                     	movq	%rsp, %rbp
   418b6: 48 89 f8                     	movq	%rdi, %rax
   418b9: 48 8b 51 10                  	movq	0x10(%rcx), %rdx
   418bd: 48 89 57 10                  	movq	%rdx, 0x10(%rdi)
   418c1: 0f 10 01                     	movups	(%rcx), %xmm0
   418c4: 0f 11 07                     	movups	%xmm0, (%rdi)
   418c7: 5d                           	popq	%rbp
   418c8: c3                           	retq
   418c9: 90                           	nop
