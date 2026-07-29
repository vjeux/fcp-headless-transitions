__ZN14HGColorConform14DeleteNodeListEPPNSt3__16vectorIP26HGColorConformNodeListItemNS0_9allocatorIS3_EEEE:
00000000001d1050	pushq	%rbp
00000000001d1051	movq	%rsp, %rbp
00000000001d1054	pushq	%r15
00000000001d1056	pushq	%r14
00000000001d1058	pushq	%r12
00000000001d105a	pushq	%rbx
00000000001d105b	movq	(%rdi), %r14
00000000001d105e	testq	%r14, %r14
00000000001d1061	je	0x1d10f6
00000000001d1067	movq	%rdi, %rbx
00000000001d106a	movq	(%r14), %rdi
00000000001d106d	cmpq	0x8(%r14), %rdi
00000000001d1071	je	0x1d10d9
00000000001d1073	movl	$0x1, %r12d
00000000001d1079	xorl	%eax, %eax
00000000001d107b	jmp	0x1d10a4
00000000001d107d	nopl	(%rax)
00000000001d1080	movq	%r15, %rdi
00000000001d1083	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d1088	movq	(%rbx), %r14
00000000001d108b	movq	(%r14), %rdi
00000000001d108e	movl	%r12d, %eax
00000000001d1091	movq	0x8(%r14), %rcx
00000000001d1095	subq	%rdi, %rcx
00000000001d1098	sarq	$0x3, %rcx
00000000001d109c	incl	%r12d
00000000001d109f	cmpq	%rax, %rcx
00000000001d10a2	jbe	0x1d10d9
00000000001d10a4	movq	(%rdi,%rax,8), %r15
00000000001d10a8	testq	%r15, %r15
00000000001d10ab	je	0x1d108e
00000000001d10ad	movq	0xe0(%r15), %rdi
00000000001d10b4	testq	%rdi, %rdi
00000000001d10b7	je	0x1d10c5
00000000001d10b9	movq	%rdi, 0xe8(%r15)
00000000001d10c0	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d10c5	movq	0xd0(%r15), %rdi
00000000001d10cc	testq	%rdi, %rdi
00000000001d10cf	je	0x1d1080
00000000001d10d1	movq	(%rdi), %rax
00000000001d10d4	callq	*0x18(%rax)
00000000001d10d7	jmp	0x1d1080
00000000001d10d9	testq	%rdi, %rdi
00000000001d10dc	je	0x1d10e7
00000000001d10de	movq	%rdi, 0x8(%r14)
00000000001d10e2	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d10e7	movq	%r14, %rdi
00000000001d10ea	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d10ef	movq	$0x0, (%rbx)
00000000001d10f6	popq	%rbx
00000000001d10f7	popq	%r12
00000000001d10f9	popq	%r14
00000000001d10fb	popq	%r15
00000000001d10fd	popq	%rbp
00000000001d10fe	retq
00000000001d10ff	movq	%rax, %rdi
00000000001d1102	callq	___clang_call_terminate
00000000001d1107	nopw	(%rax,%rax)
