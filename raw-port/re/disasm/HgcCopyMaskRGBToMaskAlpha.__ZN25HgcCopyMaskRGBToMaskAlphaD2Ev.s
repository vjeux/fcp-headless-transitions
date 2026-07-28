__ZN25HgcCopyMaskRGBToMaskAlphaD2Ev:
00000000006a2cd0	pushq	%rbp
00000000006a2cd1	movq	%rsp, %rbp
00000000006a2cd4	subq	$0x20, %rsp
00000000006a2cd8	movq	%rdi, -0x8(%rbp)
00000000006a2cdc	movq	-0x8(%rbp), %rax
00000000006a2ce0	movq	%rax, -0x18(%rbp)
00000000006a2ce4	leaq	__ZTV25HgcCopyMaskRGBToMaskAlpha(%rip), %rcx ## vtable for HgcCopyMaskRGBToMaskAlpha
00000000006a2ceb	addq	$0x10, %rcx
00000000006a2cef	movq	%rcx, (%rax)
00000000006a2cf2	movq	0x1f0(%rax), %rax
00000000006a2cf9	movq	%rax, -0x10(%rbp)
00000000006a2cfd	cmpq	$0x0, %rax
00000000006a2d01	je	0x6a2d0c
00000000006a2d03	movq	-0x10(%rbp), %rdi
00000000006a2d07	callq	__ZN25HgcCopyMaskRGBToMaskAlpha5StatedlEPv ## HgcCopyMaskRGBToMaskAlpha::State::operator delete(void*)
00000000006a2d0c	movq	-0x18(%rbp), %rdi
00000000006a2d10	callq	0x6dd7c4                        ## symbol stub for: __ZN13HGColorMatrixD2Ev
00000000006a2d15	addq	$0x20, %rsp
00000000006a2d19	popq	%rbp
00000000006a2d1a	retq
00000000006a2d1b	nopl	(%rax,%rax)
