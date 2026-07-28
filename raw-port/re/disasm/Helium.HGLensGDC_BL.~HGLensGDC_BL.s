__ZN12HGLensGDC_BLD0Ev:
00000000001e3750	pushq	%rbp
00000000001e3751	movq	%rsp, %rbp
00000000001e3754	pushq	%rbx
00000000001e3755	pushq	%rax
00000000001e3756	movq	%rdi, %rbx
00000000001e3759	callq	__ZN14Hgc2LensGDC_BLD2Ev        ## Hgc2LensGDC_BL::~Hgc2LensGDC_BL()
00000000001e375e	movq	%rbx, %rdi
00000000001e3761	addq	$0x8, %rsp
00000000001e3765	popq	%rbx
00000000001e3766	popq	%rbp
00000000001e3767	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001e376c	nopl	(%rax)
