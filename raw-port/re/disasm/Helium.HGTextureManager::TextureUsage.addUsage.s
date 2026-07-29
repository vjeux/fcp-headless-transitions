__ZN16HGTextureManager12TextureUsage8addUsageERKS0_:
0000000000047b20	pushq	%rbp
0000000000047b21	movq	%rsp, %rbp
0000000000047b24	movdqu	(%rsi), %xmm0
0000000000047b28	movdqu	(%rdi), %xmm1
0000000000047b2c	paddq	%xmm0, %xmm1
0000000000047b30	movdqu	0x10(%rdi), %xmm0
0000000000047b35	movdqu	0x20(%rdi), %xmm2
0000000000047b3a	movdqu	%xmm1, (%rdi)
0000000000047b3e	movdqu	0x10(%rsi), %xmm1
0000000000047b43	paddq	%xmm0, %xmm1
0000000000047b47	movdqu	%xmm1, 0x10(%rdi)
0000000000047b4c	movdqu	0x20(%rsi), %xmm0
0000000000047b51	paddq	%xmm2, %xmm0
0000000000047b55	movdqu	%xmm0, 0x20(%rdi)
0000000000047b5a	movq	0x30(%rsi), %rax
0000000000047b5e	addq	%rax, 0x30(%rdi)
0000000000047b62	popq	%rbp
0000000000047b63	retq
0000000000047b64	nopw	%cs:(%rax,%rax)
