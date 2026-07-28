__ZNK21FFAVFQTTimecodeCursor26createSampleBufferFromDiskEi24FFMediaReaderRequestMode6CMTimeP14FFPrerollBatch:
0000000000dfb3f0	pushq	%rbp
0000000000dfb3f1	movq	%rsp, %rbp
0000000000dfb3f4	movq	%rcx, %r9
0000000000dfb3f7	movl	%edx, %r8d
0000000000dfb3fa	movl	%esi, %ecx
0000000000dfb3fc	movq	0x8(%rdi), %rax
0000000000dfb400	movq	0x10(%rdi), %rsi
0000000000dfb404	movq	%rax, %rdi
0000000000dfb407	movl	$0x1, %edx
0000000000dfb40c	popq	%rbp
0000000000dfb40d	jmp	__ZNK18FFAVFQTMediaReader26createSampleBufferFromDiskEP14AVSampleCursorbi24FFMediaReaderRequestMode6CMTimeP14FFPrerollBatch ## FFAVFQTMediaReader::createSampleBufferFromDisk(AVSampleCursor*, bool, int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
0000000000dfb412	nopw	%cs:(%rax,%rax)
