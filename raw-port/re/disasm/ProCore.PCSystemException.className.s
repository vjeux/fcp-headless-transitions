__ZNK17PCSystemException9classNameEv:
000000000003486e	pushq	%rbp
000000000003486f	movq	%rsp, %rbp
0000000000034872	pushq	%rbx
0000000000034873	pushq	%rax
0000000000034874	movq	%rdi, %rbx
0000000000034877	leaq	0x11921a(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000003487e	callq	__ZN8PCStringC1EPK10__CFString  ## PCString::PCString(__CFString const*)
0000000000034883	movq	%rbx, %rax
0000000000034886	addq	$0x8, %rsp
000000000003488a	popq	%rbx
000000000003488b	popq	%rbp
000000000003488c	retq
000000000003488d	nop
