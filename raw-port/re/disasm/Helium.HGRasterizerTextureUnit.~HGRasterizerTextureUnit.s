__ZN23HGRasterizerTextureUnitD1Ev:
00000000001959b0	pushq	%rbp
00000000001959b1	movq	%rsp, %rbp
00000000001959b4	pushq	%rbx
00000000001959b5	pushq	%rax
00000000001959b6	movq	%rdi, %rbx
00000000001959b9	movq	(%rdi), %rdi
00000000001959bc	movq	(%rdi), %rax
00000000001959bf	callq	*0x18(%rax)
00000000001959c2	movq	0x98(%rbx), %rdi
00000000001959c9	testq	%rdi, %rdi
00000000001959cc	je	0x1959d4
00000000001959ce	movq	(%rdi), %rax
00000000001959d1	callq	*0x18(%rax)
00000000001959d4	addq	$0x8, %rbx
00000000001959d8	movq	%rbx, %rdi
00000000001959db	addq	$0x8, %rsp
00000000001959df	popq	%rbx
00000000001959e0	popq	%rbp
00000000001959e1	jmp	__ZN11HGTransformD1Ev           ## HGTransform::~HGTransform()
00000000001959e6	movq	%rax, %rdi
00000000001959e9	callq	___clang_call_terminate
00000000001959ee	movq	%rax, %rdi
00000000001959f1	callq	___clang_call_terminate
00000000001959f6	nopw	%cs:(%rax,%rax)
