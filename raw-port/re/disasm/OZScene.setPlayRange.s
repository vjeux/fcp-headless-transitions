__ZN7OZScene12setPlayRangeERK11PCTimeRange:
000000000004fb30	pushq	%rbp
000000000004fb31	movq	%rsp, %rbp
000000000004fb34	cmpl	$-0x1, 0x20(%rdi)
000000000004fb38	je	0x4fb6c
000000000004fb3a	leaq	0x4e0(%rdi), %rcx
000000000004fb41	movl	$0x4f8, %eax                    ## imm = 0x4F8
000000000004fb46	cmpq	%rsi, %rcx
000000000004fb49	je	0x4fb6a
000000000004fb4b	movq	0x10(%rsi), %rdx
000000000004fb4f	movq	%rdx, 0x10(%rcx)
000000000004fb53	movups	(%rsi), %xmm0
000000000004fb56	movups	%xmm0, (%rcx)
000000000004fb59	movq	0x28(%rsi), %rcx
000000000004fb5d	movq	%rcx, 0x10(%rdi,%rax)
000000000004fb62	movups	0x18(%rsi), %xmm0
000000000004fb66	movups	%xmm0, (%rdi,%rax)
000000000004fb6a	popq	%rbp
000000000004fb6b	retq
000000000004fb6c	leaq	0x4b0(%rdi), %rcx
000000000004fb73	movl	$0x4c8, %eax                    ## imm = 0x4C8
000000000004fb78	cmpq	%rsi, %rcx
000000000004fb7b	jne	0x4fb4b
000000000004fb7d	jmp	0x4fb6a
000000000004fb7f	nop
