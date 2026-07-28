__ZN23HGPagePullTexturesGuardD1Ev:
000000000011b960	pushq	%rbp
000000000011b961	movq	%rsp, %rbp
000000000011b964	movq	(%rdi), %rdi
000000000011b967	testq	%rdi, %rdi
000000000011b96a	je	0x11b971
000000000011b96c	callq	__ZN6HGPage15ReleaseTexturesEv  ## HGPage::ReleaseTextures()
000000000011b971	popq	%rbp
000000000011b972	retq
000000000011b973	movq	%rax, %rdi
000000000011b976	callq	___clang_call_terminate
000000000011b97b	nopl	(%rax,%rax)
