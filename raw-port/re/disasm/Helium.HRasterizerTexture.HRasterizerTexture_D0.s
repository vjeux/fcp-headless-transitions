__ZN18HRasterizerTextureD0Ev:
00000000000e7410	pushq	%rbp
00000000000e7411	movq	%rsp, %rbp
00000000000e7414	pushq	%rbx
00000000000e7415	pushq	%rax
00000000000e7416	movq	%rdi, %rbx
00000000000e7419	callq	__ZN20HgcRasterizerTextureD2Ev  ## HgcRasterizerTexture::~HgcRasterizerTexture()
00000000000e741e	movq	%rbx, %rdi
00000000000e7421	addq	$0x8, %rsp
00000000000e7425	popq	%rbx
00000000000e7426	popq	%rbp
00000000000e7427	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000e742c	nopl	(%rax)
