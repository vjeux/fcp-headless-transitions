__ZNK16HGGradientRadial7label_BEv:
000000000008c7a0	pushq	%rbp
000000000008c7a1	movq	%rsp, %rbp
000000000008c7a4	movl	0x198(%rdi), %eax
000000000008c7aa	cmpq	$0x2, %rax
000000000008c7ae	ja	0x8c7c0
000000000008c7b0	leaq	0x34083d(%rip), %rcx
000000000008c7b7	movslq	(%rcx,%rax,4), %rax
000000000008c7bb	addq	%rcx, %rax
000000000008c7be	popq	%rbp
000000000008c7bf	retq
000000000008c7c0	leaq	0x828a41(%rip), %rax            ## literal pool for: "kXFormPerspective"
000000000008c7c7	popq	%rbp
000000000008c7c8	retq
000000000008c7c9	nopl	(%rax)
