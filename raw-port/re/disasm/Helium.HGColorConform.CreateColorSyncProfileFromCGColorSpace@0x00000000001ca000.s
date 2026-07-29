__ZN14HGColorConform38CreateColorSyncProfileFromCGColorSpaceEP12CGColorSpace:
00000000001ca000	pushq	%rbp
00000000001ca001	movq	%rsp, %rbp
00000000001ca004	pushq	%r14
00000000001ca006	pushq	%rbx
00000000001ca007	callq	0x3c4b6e                        ## symbol stub for: _CGColorSpaceCopyICCData
00000000001ca00c	testq	%rax, %rax
00000000001ca00f	je	0x1ca031
00000000001ca011	movq	%rax, %rbx
00000000001ca014	movq	%rax, %rdi
00000000001ca017	xorl	%esi, %esi
00000000001ca019	callq	0x3c4d96                        ## symbol stub for: _ColorSyncProfileCreate
00000000001ca01e	movq	%rax, %r14
00000000001ca021	movq	%rbx, %rdi
00000000001ca024	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
00000000001ca029	movq	%r14, %rax
00000000001ca02c	popq	%rbx
00000000001ca02d	popq	%r14
00000000001ca02f	popq	%rbp
00000000001ca030	retq
00000000001ca031	xorl	%eax, %eax
00000000001ca033	popq	%rbx
00000000001ca034	popq	%r14
00000000001ca036	popq	%rbp
00000000001ca037	retq
00000000001ca038	nopl	(%rax,%rax)
