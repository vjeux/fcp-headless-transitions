__ZN28FFAudioUnitEffect_InitializeD1Ev:
000000000052c810	pushq	%rbp
000000000052c811	movq	%rsp, %rbp
000000000052c814	pushq	%rbx
000000000052c815	pushq	%rax
000000000052c816	movq	0x13c0b83(%rip), %rdi           ## literal pool symbol address: _OBJC_CLASS_$_NSAutoreleasePool
000000000052c81d	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
000000000052c822	movq	%rax, %rbx
000000000052c825	leaq	_OBJC_CLASS_$_FFAudioUnitInfoCacheBase(%rip), %rdi
000000000052c82c	movq	0x16a4225(%rip), %rsi
000000000052c833	callq	*0x13c0e87(%rip)                ## Objc message: -[%rdi observer]
000000000052c839	movq	%rbx, %rdi
000000000052c83c	callq	*0x13c0ec6(%rip)                ## literal pool symbol address: _objc_release
000000000052c842	addq	$0x8, %rsp
000000000052c846	popq	%rbx
000000000052c847	popq	%rbp
000000000052c848	retq
000000000052c849	movq	%rax, %rdi
000000000052c84c	callq	___clang_call_terminate
000000000052c851	nopw	%cs:(%rax,%rax)
