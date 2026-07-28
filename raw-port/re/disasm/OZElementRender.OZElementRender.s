__ZN15OZElementRenderC1EP9OZElementP11OZImageNodeRK14OZRenderParams:
0000000000451210	pushq	%rbp
0000000000451211	movq	%rsp, %rbp
0000000000451214	pushq	%r15
0000000000451216	pushq	%r14
0000000000451218	pushq	%r13
000000000045121a	pushq	%r12
000000000045121c	pushq	%rbx
000000000045121d	pushq	%rax
000000000045121e	movq	%rcx, %r12
0000000000451221	movq	%rdx, %r13
0000000000451224	movq	%rsi, %r14
0000000000451227	movq	%rdi, %rbx
000000000045122a	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
0000000000451231	addq	$0x10, %rax
0000000000451235	movq	%rax, 0x5e8(%rdi)
000000000045123c	movq	$0x0, 0x5f0(%rdi)
0000000000451247	leaq	0x5d8(%rdi), %r15
000000000045124e	leaq	0x4164eb(%rip), %rsi
0000000000451255	movq	%r15, %rdi
0000000000451258	callq	0x6dd83c                        ## symbol stub for: __ZN13LiImageSourceC2Ev
000000000045125d	leaq	0x4164b4(%rip), %rsi
0000000000451264	movq	%rbx, %rdi
0000000000451267	movq	%r13, %rdx
000000000045126a	movq	%r12, %rcx
000000000045126d	callq	__ZN17OZImageNodeRenderC2EP11OZImageNodeRK14OZRenderParams ## OZImageNodeRender::OZImageNodeRender(OZImageNode*, OZRenderParams const&)
0000000000451272	leaq	0x4162b7(%rip), %rax
0000000000451279	movq	%rax, (%rbx)
000000000045127c	leaq	0x4163ad(%rip), %rax
0000000000451283	movq	%rax, 0x5d8(%rbx)
000000000045128a	leaq	0x416467(%rip), %rax
0000000000451291	movq	%rax, 0x5e8(%rbx)
0000000000451298	movq	%r14, 0x5d0(%rbx)
000000000045129f	addq	$0x8, %rsp
00000000004512a3	popq	%rbx
00000000004512a4	popq	%r12
00000000004512a6	popq	%r13
00000000004512a8	popq	%r14
00000000004512aa	popq	%r15
00000000004512ac	popq	%rbp
00000000004512ad	retq
00000000004512ae	movq	%rax, %r14
00000000004512b1	leaq	0x416488(%rip), %rsi
00000000004512b8	movq	%r15, %rdi
00000000004512bb	callq	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
00000000004512c0	jmp	0x4512c5
00000000004512c2	movq	%rax, %r14
00000000004512c5	addq	$0x5e8, %rbx                    ## imm = 0x5E8
00000000004512cc	movq	%rbx, %rdi
00000000004512cf	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
00000000004512d4	movq	%r14, %rdi
00000000004512d7	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004512dc	nopl	(%rax)
