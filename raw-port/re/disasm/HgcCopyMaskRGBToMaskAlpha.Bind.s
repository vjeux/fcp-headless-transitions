__ZN25HgcCopyMaskRGBToMaskAlpha4BindEP9HGHandler:
00000000006a2320	pushq	%rbp
00000000006a2321	movq	%rsp, %rbp
00000000006a2324	subq	$0x10, %rsp
00000000006a2328	movq	%rdi, -0x8(%rbp)
00000000006a232c	movq	%rsi, -0x10(%rbp)
00000000006a2330	movq	-0x8(%rbp), %rdi
00000000006a2334	movq	-0x10(%rbp), %rsi
00000000006a2338	movq	(%rdi), %rax
00000000006a233b	callq	*0xc0(%rax)
00000000006a2341	xorl	%eax, %eax
00000000006a2343	addq	$0x10, %rsp
00000000006a2347	popq	%rbp
00000000006a2348	retq
00000000006a2349	nopl	(%rax)
