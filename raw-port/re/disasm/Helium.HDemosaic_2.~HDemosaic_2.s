__ZN11HDemosaic_2D0Ev:
00000000000ddc00	pushq	%rbp
00000000000ddc01	movq	%rsp, %rbp
00000000000ddc04	pushq	%rbx
00000000000ddc05	pushq	%rax
00000000000ddc06	movq	%rdi, %rbx
00000000000ddc09	callq	__ZN13HgcDemosaic_2D2Ev         ## HgcDemosaic_2::~HgcDemosaic_2()
00000000000ddc0e	movq	%rbx, %rdi
00000000000ddc11	addq	$0x8, %rsp
00000000000ddc15	popq	%rbx
00000000000ddc16	popq	%rbp
00000000000ddc17	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ddc1c	nopl	(%rax)
