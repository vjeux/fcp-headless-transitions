__ZN25HgcCopyMaskRGBToMaskAlphaD0Ev:
00000000006a2d40	pushq	%rbp
00000000006a2d41	movq	%rsp, %rbp
00000000006a2d44	subq	$0x10, %rsp
00000000006a2d48	movq	%rdi, -0x8(%rbp)
00000000006a2d4c	movq	-0x8(%rbp), %rdi
00000000006a2d50	movq	%rdi, -0x10(%rbp)
00000000006a2d54	callq	__ZN25HgcCopyMaskRGBToMaskAlphaD1Ev ## HgcCopyMaskRGBToMaskAlpha::~HgcCopyMaskRGBToMaskAlpha()
00000000006a2d59	movq	-0x10(%rbp), %rdi
00000000006a2d5d	callq	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
00000000006a2d62	addq	$0x10, %rsp
00000000006a2d66	popq	%rbp
00000000006a2d67	retq
00000000006a2d68	nopl	(%rax,%rax)
