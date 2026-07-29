__ZN19OZMaterialLayerBase20getTextureTokensLockEv:
00000000004ac770	pushq	%rbp
00000000004ac771	movq	%rsp, %rbp
00000000004ac774	pushq	%rbx
00000000004ac775	pushq	%rax
00000000004ac776	movq	%rdi, %rbx
00000000004ac779	leaq	0x4c0(%rsi), %rdi
00000000004ac780	movq	%rdi, (%rbx)
00000000004ac783	callq	0x6dd446                        ## symbol stub for: __ZN10PCSpinLock4lockEv
00000000004ac788	movq	%rbx, %rax
00000000004ac78b	addq	$0x8, %rsp
00000000004ac78f	popq	%rbx
00000000004ac790	popq	%rbp
00000000004ac791	retq
00000000004ac792	nopw	%cs:(%rax,%rax)
