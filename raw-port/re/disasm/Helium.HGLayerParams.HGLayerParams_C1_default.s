__ZN13HGLayerParamsC1Ev:
000000000002bdd0	pushq	%rbp
000000000002bdd1	movq	%rsp, %rbp
000000000002bdd4	movabsq	$0x3f80000000000000, %rax       ## imm = 0x3F80000000000000
000000000002bdde	movq	%rax, (%rdi)
000000000002bde1	movl	$0x0, 0x8(%rdi)
000000000002bde8	movaps	0x39be51(%rip), %xmm0
000000000002bdef	movaps	%xmm0, 0x10(%rdi)
000000000002bdf3	movl	$0x0, 0x20(%rdi)
000000000002bdfa	popq	%rbp
000000000002bdfb	retq
000000000002bdfc	nopl	(%rax)
__ZN13HGLayerParamsC2EifiRKDv4_f:
