__ZN15OZSimStateArray18setOwnedObjectFromERKS_:
0000000000283fa0	pushq	%rbp
0000000000283fa1	movq	%rsp, %rbp
0000000000283fa4	pushq	%r14
0000000000283fa6	pushq	%rbx
0000000000283fa7	subq	$0x10, %rsp
0000000000283fab	movq	%rdi, %rbx
0000000000283fae	movq	0x38(%rsi), %rax
0000000000283fb2	movq	%rax, 0x38(%rdi)
0000000000283fb6	addq	$0x40, %rbx
0000000000283fba	addq	$0x40, %rsi
0000000000283fbe	leaq	-0x18(%rbp), %r14
0000000000283fc2	movq	%r14, %rdi
0000000000283fc5	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
0000000000283fca	movq	%rbx, %rdi
0000000000283fcd	movq	%r14, %rsi
0000000000283fd0	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
0000000000283fd5	leaq	-0x18(%rbp), %rdi
0000000000283fd9	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000283fde	addq	$0x10, %rsp
0000000000283fe2	popq	%rbx
0000000000283fe3	popq	%r14
0000000000283fe5	popq	%rbp
0000000000283fe6	retq
0000000000283fe7	movq	%rax, %rbx
0000000000283fea	leaq	-0x18(%rbp), %rdi
0000000000283fee	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000283ff3	movq	%rbx, %rdi
0000000000283ff6	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000283ffb	nopl	(%rax,%rax)
