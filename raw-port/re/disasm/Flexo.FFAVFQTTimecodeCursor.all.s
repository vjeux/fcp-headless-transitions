__ZN21FFAVFQTTimecodeCursorC1EP18FFAVFQTMediaReaderP14AVSampleCursori:
__ZN21FFAVFQTTimecodeCursorC2EP18FFAVFQTMediaReaderP14AVSampleCursori:
  dfb390:	pushq	%rbp
  dfb391:	movq	%rsp, %rbp
  dfb394:	pushq	%rbx
  dfb395:	pushq	%rax
  dfb396:	movq	%rdi, %rbx
  dfb399:	callq	__ZN19FFAVFTimecodeCursorC2EP16FFAVFMediaReaderP14AVSampleCursor ## FFAVFTimecodeCursor::FFAVFTimecodeCursor(FFAVFMediaReader*, AVSampleCursor*)
  dfb39e:	leaq	0xb1aa3b(%rip), %rax
  dfb3a5:	movq	%rax, (%rbx)
  dfb3a8:	addq	$0x8, %rsp
  dfb3ac:	popq	%rbx
  dfb3ad:	popq	%rbp
  dfb3ae:	retq
  dfb3af:	nop
__ZN21FFAVFQTTimecodeCursorD2Ev:
  dfb3b0:	pushq	%rbp
  dfb3b1:	movq	%rsp, %rbp
  dfb3b4:	popq	%rbp
  dfb3b5:	jmp	__ZN19FFAVFTimecodeCursorD2Ev ## FFAVFTimecodeCursor::~FFAVFTimecodeCursor()
  dfb3ba:	nopw	(%rax,%rax)
__ZN21FFAVFQTTimecodeCursorD1Ev:
  dfb3c0:	pushq	%rbp
  dfb3c1:	movq	%rsp, %rbp
  dfb3c4:	popq	%rbp
  dfb3c5:	jmp	__ZN19FFAVFTimecodeCursorD2Ev ## FFAVFTimecodeCursor::~FFAVFTimecodeCursor()
  dfb3ca:	nopw	(%rax,%rax)
__ZN21FFAVFQTTimecodeCursorD0Ev:
  dfb3d0:	pushq	%rbp
  dfb3d1:	movq	%rsp, %rbp
  dfb3d4:	pushq	%rbx
  dfb3d5:	pushq	%rax
  dfb3d6:	movq	%rdi, %rbx
  dfb3d9:	callq	__ZN19FFAVFTimecodeCursorD2Ev ## FFAVFTimecodeCursor::~FFAVFTimecodeCursor()
  dfb3de:	movq	%rbx, %rdi
  dfb3e1:	addq	$0x8, %rsp
  dfb3e5:	popq	%rbx
  dfb3e6:	popq	%rbp
  dfb3e7:	jmp	0x1497404 ## symbol stub for: __ZdlPv
  dfb3ec:	nopl	(%rax)
__ZNK21FFAVFQTTimecodeCursor26createSampleBufferFromDiskEi24FFMediaReaderRequestMode6CMTimeP14FFPrerollBatch:
  dfb3f0:	pushq	%rbp
  dfb3f1:	movq	%rsp, %rbp
  dfb3f4:	movq	%rcx, %r9
  dfb3f7:	movl	%edx, %r8d
  dfb3fa:	movl	%esi, %ecx
  dfb3fc:	movq	0x8(%rdi), %rax
  dfb400:	movq	0x10(%rdi), %rsi
  dfb404:	movq	%rax, %rdi
  dfb407:	movl	$0x1, %edx
  dfb40c:	popq	%rbp
  dfb40d:	jmp	__ZNK18FFAVFQTMediaReader26createSampleBufferFromDiskEP14AVSampleCursorbi24FFMediaReaderRequestMode6CMTimeP14FFPrerollBatch ## FFAVFQTMediaReader::createSampleBufferFromDisk(AVSampleCursor*, bool, int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
  dfb412:	nopw	%cs:(%rax,%rax)
__ZN21FFAVFQTMetadataCursorC1EP18FFAVFQTMediaReaderP14AVSampleCursori:
__ZN21FFAVFQTMetadataCursorC2EP18FFAVFQTMediaReaderP14AVSampleCursori:
