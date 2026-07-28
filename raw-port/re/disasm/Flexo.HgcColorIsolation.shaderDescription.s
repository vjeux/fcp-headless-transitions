__ZNK17HgcColorIsolation17shaderDescriptionEv:
000000000145b250	pushq	%rbp
000000000145b251	movq	%rsp, %rbp
000000000145b254	pushq	%rbx
000000000145b255	pushq	%rax
000000000145b256	movq	%rdi, %rbx
000000000145b259	movl	$0x20, %edi
000000000145b25e	callq	0x1497452                       ## symbol stub for: __Znwm
000000000145b263	movq	%rax, 0x10(%rbx)
000000000145b267	movq	$0x21, (%rbx)
000000000145b26e	movq	$0x18, 0x8(%rbx)
000000000145b276	movabsq	$0x5d316367685b206e, %rcx       ## imm = 0x5D316367685B206E
000000000145b280	movq	%rcx, 0x10(%rax)
000000000145b284	movups	0x24b3c3(%rip), %xmm0           ## literal pool for: "HgcColorIsolation [hgc1]"
000000000145b28b	movups	%xmm0, (%rax)
000000000145b28e	movb	$0x0, 0x18(%rax)
000000000145b292	movq	%rbx, %rax
000000000145b295	addq	$0x8, %rsp
000000000145b299	popq	%rbx
000000000145b29a	popq	%rbp
000000000145b29b	retq
000000000145b29c	nopl	(%rax)
