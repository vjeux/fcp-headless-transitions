__ZNK19PCBadIndexException9classNameEv:
00000000000c4d7c	pushq	%rbp
00000000000c4d7d	movq	%rsp, %rbp
00000000000c4d80	pushq	%rbx
00000000000c4d81	pushq	%rax
00000000000c4d82	movq	%rdi, %rbx
00000000000c4d85	leaq	0x8b5cc(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000c4d8c	callq	__ZN8PCStringC1EPK10__CFString  ## PCString::PCString(__CFString const*)
00000000000c4d91	movq	%rbx, %rax
00000000000c4d94	addq	$0x8, %rsp
00000000000c4d98	popq	%rbx
00000000000c4d99	popq	%rbp
00000000000c4d9a	retq
00000000000c4d9b	nop
