__ZNK23PCDivideByZeroException9classNameEv:
00000000000678b6	pushq	%rbp
00000000000678b7	movq	%rsp, %rbp
00000000000678ba	pushq	%rbx
00000000000678bb	pushq	%rax
00000000000678bc	movq	%rdi, %rbx
00000000000678bf	leaq	0xe6632(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000678c6	callq	__ZN8PCStringC1EPK10__CFString  ## PCString::PCString(__CFString const*)
00000000000678cb	movq	%rbx, %rax
00000000000678ce	addq	$0x8, %rsp
00000000000678d2	popq	%rbx
00000000000678d3	popq	%rbp
00000000000678d4	retq
00000000000678d5	nop
