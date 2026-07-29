__ZN4HGPQ7PQToSDRD1Ev:
00000000000ff060	pushq	%rbp
00000000000ff061	movq	%rsp, %rbp
00000000000ff064	pushq	%rbx
00000000000ff065	pushq	%rax
00000000000ff066	movq	%rdi, %rbx
00000000000ff069	leaq	0x917a10(%rip), %rax
00000000000ff070	movq	%rax, (%rdi)
00000000000ff073	movq	0x198(%rdi), %rdi
00000000000ff07a	testq	%rdi, %rdi
00000000000ff07d	je	0xff085
00000000000ff07f	movq	(%rdi), %rax
00000000000ff082	callq	*0x18(%rax)
00000000000ff085	movq	0x1c0(%rbx), %rdi
00000000000ff08c	testq	%rdi, %rdi
00000000000ff08f	je	0xff097
00000000000ff091	movq	(%rdi), %rax
00000000000ff094	callq	*0x18(%rax)
00000000000ff097	movq	0x1c8(%rbx), %rdi
00000000000ff09e	testq	%rdi, %rdi
00000000000ff0a1	je	0xff0a9
00000000000ff0a3	movq	(%rdi), %rax
00000000000ff0a6	callq	*0x18(%rax)
00000000000ff0a9	movq	%rbx, %rdi
00000000000ff0ac	addq	$0x8, %rsp
00000000000ff0b0	popq	%rbx
00000000000ff0b1	popq	%rbp
00000000000ff0b2	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000ff0b7	movq	%rax, %rdi
00000000000ff0ba	callq	___clang_call_terminate
00000000000ff0bf	nop
