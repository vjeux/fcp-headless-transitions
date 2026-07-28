__ZNK14HgcBlendBlur_317shaderDescriptionEv:
0000000000235de0	pushq	%rbp
0000000000235de1	movq	%rsp, %rbp
0000000000235de4	movq	%rdi, %rax
0000000000235de7	movb	$0x2a, (%rdi)
0000000000235dea	movabsq	$0x5d316367685b2033, %rcx       ## imm = 0x5D316367685B2033
0000000000235df4	movq	%rcx, 0xe(%rdi)
0000000000235df8	movups	0x6e880a(%rip), %xmm0           ## literal pool for: "HgcBlendBlur_3 [hgc1]"
0000000000235dff	movups	%xmm0, 0x1(%rdi)
0000000000235e03	movb	$0x0, 0x16(%rdi)
0000000000235e07	popq	%rbp
0000000000235e08	retq
0000000000235e09	nopl	(%rax)
