__ZN18OZSimpleCameraUndoC1EP10OZDocumentiiPK14LiSimpleCamera:
00000000001062a0	pushq	%rbp
00000000001062a1	movq	%rsp, %rbp
00000000001062a4	pushq	%r15
00000000001062a6	pushq	%r14
00000000001062a8	pushq	%r13
00000000001062aa	pushq	%r12
00000000001062ac	pushq	%rbx
00000000001062ad	pushq	%rax
00000000001062ae	movq	%r8, -0x30(%rbp)
00000000001062b2	movl	%ecx, %r15d
00000000001062b5	movl	%edx, %r12d
00000000001062b8	movq	%rsi, %r13
00000000001062bb	movq	%rdi, %r14
00000000001062be	leaq	0x73755b(%rip), %rax
00000000001062c5	movq	%rax, (%rdi)
00000000001062c8	leaq	0x8(%rdi), %rbx
00000000001062cc	movq	%rbx, %rdi
00000000001062cf	callq	0x6ddc5c                        ## symbol stub for: __ZN14LiSimpleCameraC1Ev
00000000001062d4	movq	%r13, 0x220(%r14)
00000000001062db	movl	%r12d, 0x228(%r14)
00000000001062e2	movl	%r15d, 0x22c(%r14)
00000000001062e9	movq	%rbx, %rdi
00000000001062ec	movq	-0x30(%rbp), %rsi
00000000001062f0	callq	0x6ddc56                        ## symbol stub for: __ZN14LiSimpleCamera3setEPK8LiCamera
00000000001062f5	addq	$0x8, %rsp
00000000001062f9	popq	%rbx
00000000001062fa	popq	%r12
00000000001062fc	popq	%r13
00000000001062fe	popq	%r14
0000000000106300	popq	%r15
0000000000106302	popq	%rbp
0000000000106303	retq
0000000000106304	movq	%rax, %r14
0000000000106307	movq	%rbx, %rdi
000000000010630a	callq	0x6ddc68                        ## symbol stub for: __ZN14LiSimpleCameraD1Ev
000000000010630f	movq	%r14, %rdi
0000000000106312	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000106317	nopw	(%rax,%rax)
