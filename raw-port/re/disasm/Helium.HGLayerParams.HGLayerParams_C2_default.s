__ZN13HGLayerParamsC2Ev:
000000000002bda0	pushq	%rbp
000000000002bda1	movq	%rsp, %rbp
000000000002bda4	movabsq	$0x3f80000000000000, %rax       ## imm = 0x3F80000000000000
000000000002bdae	movq	%rax, (%rdi)
000000000002bdb1	movl	$0x0, 0x8(%rdi)
000000000002bdb8	movaps	0x39be81(%rip), %xmm0
000000000002bdbf	movaps	%xmm0, 0x10(%rdi)
000000000002bdc3	movl	$0x0, 0x20(%rdi)
000000000002bdca	popq	%rbp
000000000002bdcb	retq
000000000002bdcc	nopl	(%rax)
__ZN13HGLayerParamsC1Ev:
